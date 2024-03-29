from django.db import models
from django.core import files
from django.conf import settings

import logging
import json
import io
import os

from .documents import DocumentMixin, DocumentType
from .templates import FillField
from ..gpt import Chat, ChatException


logger = logging.getLogger(__name__)

class NoChosenResumeError(Exception):
  pass

class TailoredDocument(models.Model, DocumentMixin):
  user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tailored_documents")
  name = models.TextField()
  job = models.ForeignKey(to="Job", on_delete=models.RESTRICT, related_name="tailored_documents")
  template = models.ForeignKey(to="Template", on_delete=models.RESTRICT, related_name="tailored_documents")
  version = models.IntegerField(default=1)
  docx = models.FileField(upload_to="tailored_documents/")
  png = models.FileField(upload_to="tailored_documents/")
  chat_messages = models.JSONField(blank=True, null=True)
  type = models.CharField(max_length=20, choices=DocumentType.choices)

  class Meta:
    constraints = [
      models.UniqueConstraint(
        fields=["user", "job", "version", "type"], name="tailored_document_unique_job_version_type"
      ),
      models.UniqueConstraint(
        fields=["user", "name", "type"], name="tailored_document_unique_name_type"
      ),
    ]

  @classmethod
  def get_next_version(cls, user, type, job):
    return cls.objects.filter(user=user, type=type, job=job).aggregate(
      models.Max("version")
    )["version__max"] + 1

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    if TailoredDocument.objects.filter(user=self.user, type=self.type, job=self.job).exists():
      self.version = TailoredDocument.get_next_version(self.user, self.type, self.job)
    else:
      self.version = TailoredDocument._meta.get_field("version").default
    self.name = f"{self.job.title}, {self.job.company}, v{self.version}"

    if self.type == DocumentType.COVER_LETTER:
      resume_count = self.job.tailored_documents.filter(user=self.user, type=DocumentType.RESUME).count()
      if self.job.chosen_resume is None:
        if resume_count == 0:
          raise NoChosenResumeError("you must create a resume before you can generate a cover letter")
        elif resume_count > 1:
          raise NoChosenResumeError("you must choose a resume before you can generate a cover letter")
        else: # resume_count == 1
          chosen_resume = self.job.tailored_documents.get(user=self.user, type=DocumentType.RESUME)
          self.job.chosen_resume = chosen_resume
          self.job.save()
      else:
        chosen_resume = self.job.chosen_resume      
      self.chat_messages = chosen_resume.chat_messages

    fill = kwargs.pop("fill", True)
    super().save(*args, **kwargs)
    if fill:
      try:
        self.fill()
        self.generate_docx()
        self.generate_png()
      except Exception as e:
        self.delete()
        raise e

  def __update(self, *args, **kwargs):
    super().save(*args, **kwargs)

  def delete(self, *args, **kwargs):
    if self.docx:
      os.remove(self.docx.path)
    if self.png:
      os.remove(self.png.path)
    super().delete(*args, **kwargs)
  
  @property
  def default_substitutions(self):
    return {
      "JOB_TITLE": self.job.title,
      "COMPANY": self.job.company,
    }

  @property
  def is_filled(self):
    return self.substitutions.count() > 0

  def fill(self):
    if self.is_filled:
      raise Exception("you can only fill a tailored document once")
    
    template_text = self.template.extract_text(substitutions=self.default_substitutions)
    fill_field_keys = self.template.extract_fill_field_keys(text=template_text, include_default=False)
    
    # construct the fill_fields_text part of the prompt    
    fill_fields_text = ""
    for key in fill_field_keys:
      fill_field = FillField.objects.get(user=self.user, key=key, template=self.template)
      if fill_field is None:
        raise Exception(f"fill field {key} not found")
      if fill_field.description == "":
        description = key
      else:
        description = fill_field.description

      fill_fields_text +=\
f"""<fill_field>
<key>{key}</key>
<description>{description}</description>
</fill_field>\n"""
      
    additional_information_text = ""    
    if self.template.additional_information != "":
      additional_information_text += f"""
The user has provided the following additional information to help you tailor the document:
<additional_information>{self.template.additional_information}</additional_information>"""

    # ask GPT to fill in the fill fields
    chat = Chat(self.user.username, self.chat_messages)
    response = json.loads(
      chat.ask(prompt_name="fill_template", substitutions={
        "template_text": template_text,
        "document_type": self.get_type_display(),
        "job_posting": self.job.posting,
        "job_title": self.job.title,
        "company": self.job.company,
        "fill_fields_text": fill_fields_text,
        "additional_information_text": additional_information_text,
      })["content"]
    )

    substitutions = {}
    try:
      for key in fill_field_keys:
        substitutions[key] = response[key]
    except KeyError:
      raise ChatException(response["error"])
    for key, value in self.default_substitutions.items():
      substitutions[key] = value

    # save the chat messages 
    self.chat_messages = chat.get_messages()
    self.save()

    # create the substitutions from substitutions
    for key, value in substitutions.items():
      substitution = Substitution(
        user=self.user,
        tailored_document=self,
        key=key,
        value=value,
      )
      substitution.save()

  def generate_docx(self, replace=False):
    if not self.is_filled:
      raise Exception(
        "you have to fill the tailored document before you can generate a docx file"
      )

    # get all the fill fields
    all_substitutions = self.default_substitutions
    for substitution in self.substitutions.all():
      all_substitutions[substitution.key] = substitution.value

    # substitute the fill fields into the template document
    template_document = self.template.open_document()
    inRun = False
    keySoFar = ""
    for para in template_document.paragraphs:
      for run in para.runs:
        if inRun:
          logger.debug(f"run.text: {run.text}")
          logger.debug(f"keySoFar: {keySoFar}")
        for key, value in all_substitutions.items():
          if "{{" + key + "}}" in run.text:
            run.text = run.text.replace("{{" + key + "}}", value)
        if inRun:
          if "}}" in run.text:
            split = run.text.split("}}")
            keySoFar += split[0]
            for key, value in all_substitutions.items():
              if keySoFar == key:
                run.text = value + "".join(split[1:])
            inRun = False
            keySoFar = ""
          else:
            keySoFar += run.text
            run.text = ""
        if "{{" in run.text:
          split = run.text.split("{{")
          run.text = split[0]
          keySoFar = "".join(split[1:])
          inRun = True

    # save the document to file stream
    file_stream = io.BytesIO()
    template_document.save(file_stream)

    def sanitise_file_name(file_name):
      return "".join(c for c in file_name if c.isascii() and (c.isalnum() or c in ["_", "-"]))
    
    # save the file stream to the file field
    file_name = f"{self.type}_{sanitise_file_name(self.job.title)}_{sanitise_file_name(self.job.company)}_v{self.version}.docx"    

    if replace:
      # move the old file to a temporary location
      os.system(f"mv {self.docx.path} {self.docx.path}.tmp")
      
    self.docx.save(file_name, files.File(file_stream))

    if replace:
      # remove the old file
      os.remove(f"{self.docx.path}.tmp")

  def duplicate(self):
    new_tailored_document = TailoredDocument(
      user=self.user,
      job=self.job,
      template=self.template,
    )
    new_tailored_document.save(fill=False)
    for substitution in self.substitutions.all():
      new_substitution = Substitution(
        user=substitution.user,
        tailored_document=new_tailored_document,
        key=substitution.key,
        value=substitution.value,
      )
      new_substitution.save()
    new_tailored_document.chat_messages = self.chat_messages
    new_tailored_document.generate_docx()
    new_tailored_document.generate_png()
    return new_tailored_document


class Substitution(models.Model):
  user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="substitutions")
  tailored_document = models.ForeignKey(to="TailoredDocument", on_delete=models.CASCADE, related_name="substitutions")
  key = models.TextField()
  value = models.TextField(blank=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["user", "tailored_document", "key"], name="substitution_unique_tailored_document_key"),
    ]

  def __str__(self):
    return f"{self.key} for {self.tailored_document}"
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)
  
  def __create(self, *args, **kwargs):
    super().save(*args, **kwargs)
  
  def __update(self, *args, **kwargs):
    super().save(*args, **kwargs)
    self.tailored_document.generate_docx(replace=True)
    self.tailored_document.generate_png(replace=True)

    if self.key not in self.tailored_document.default_substitutions:
      chat = Chat(self.user.username, self.tailored_document.chat_messages)
      chat.log(f"""Log: the user has updated the fill field with the key `{self.key}` to the following value:
  <saved_value>{self.value}</saved_value>.""")
      self.tailored_document.chat_messages = chat.get_messages()
      self.tailored_document.save()
  
  def regenerate(self, current_value, feedback=None):
    chat = Chat(self.user.username, self.tailored_document.chat_messages)

    current_value_message = ""
    if current_value != "":
      current_value_message = f"""Here is the current value of the fill field when the user pressed the \"regenerate\" button:
<current_value>{current_value}</current_value>

"""

    substitutions = {
      "key": self.key,
      "current_value_message": current_value_message,
    }

    if feedback is None:
      response_message = chat.ask(prompt_name="regenerate_substitution_without_feedback", substitutions=substitutions)
    else:
      substitutions["feedback"] = feedback
      response_message = chat.ask(prompt_name="regenerate_substitution_with_feedback", substitutions=substitutions)

    try:
      response_content = response_message["content"]
      response = json.loads(response_content)
      substitution = Substitution(
        user=self.user,
        id=self.id,
        tailored_document=self.tailored_document,
        key=self.key,
        value=response[self.key],
      )

      self.tailored_document.chat_messages = chat.get_messages()
      self.tailored_document.save()

      return substitution
    except KeyError:
      raise ChatException(response["error"])
