from django.db import models
from django.core import files

import json
import io

from .documents import DocumentMixin
from .templates import FillField
from ..gpt import Chat, ChatException


class TailoredDocument(models.Model, DocumentMixin):
  name = models.TextField(unique=True)
  job = models.ForeignKey(to="Job", on_delete=models.RESTRICT, related_name="tailoredDocuments")
  template = models.ForeignKey(to="Template", on_delete=models.RESTRICT, related_name="tailoredDocuments")
  version = models.IntegerField(default=1)
  docx = models.FileField(upload_to='tailoredDocuments/')
  png = models.FileField(upload_to='tailoredDocuments/')
  chat_messages = models.JSONField(blank=True, null=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(
        fields=['job', 'version'], name='unique_job_version'
      )
    ]

  @classmethod
  def get_next_version(cls, job):
    return cls.objects.filter(job=job).aggregate(
      models.Max('version')
    )["version__max"] + 1

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    if TailoredDocument.objects.filter(job=self.job).exists():
      self.version = TailoredDocument.get_next_version(self.job)
    else:
      self.version = TailoredDocument._meta.get_field("version").default
    self.name = f'{self.job.title}, {self.job.company}, v{self.version}'

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
    fillField_keys = self.template.extract_fillField_keys(text=template_text, include_default=False)
    
    # construct the fillFields_text part of the prompt    
    fillFields_text = ""
    for key in fillField_keys:
      fillField = FillField.objects.get(key=key, template=self.template)
      if fillField is None:
        raise Exception(f"fillField {key} not found")
      if fillField.description == "":
        description = key
      else:
        description = fillField.description

      fillFields_text +=\
f"""<fillField>
<key>{key}</key>
<description>{description}</description>
</fillField>\n"""

    # ask GPT to fill in the fillFields
    chat = Chat()
    response = json.loads(
      chat.ask(prompt_name="fill_resume_template", substitutions={
        "resume_template_text": template_text,
        "job_posting": self.job.posting,
        "job_title": self.job.title,
        "company": self.job.company,
        "fillFields_text": fillFields_text,
      })["content"]
    )

    substitutions = {}
    try:
      for key in fillField_keys:
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
        tailored_document=self,
        key=key,
        value=value,
      )
      substitution.save()

  def generate_docx(self):
    if not self.is_filled:
      raise Exception(
        "you have to fill the tailored document before you can generate a docx file"
      )

    # get all the fillFields
    all_substitutions = self.default_substitutions
    for substitution in self.substitutions.all():
      all_substitutions[substitution.key] = substitution.value

    # substitute the fillFields into the template document
    template_document = self.template.open_document()
    for para in template_document.paragraphs:
      for run in para.runs:
        for key, value in all_substitutions.items():
          if "{{" + key + "}}" in run.text:
            run.text = run.text.replace("{{" + key + "}}", value)

    # save the document to file stream
    file_stream = io.BytesIO()
    template_document.save(file_stream)
    
    # save the file stream to the file field
    file_name = f"{self.job.title}_{self.job.company}_v{self.version}.docx"    
    self.docx.save(file_name, files.File(file_stream))

  def duplicate(self):
    new_tailored_document = TailoredDocument(
      job=self.job,
      template=self.template,
    )
    new_tailored_document.save(fill=False)
    for substitution in self.substitutions.all():
      new_substitution = Substitution(
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
  tailored_document = models.ForeignKey(to="TailoredDocument", on_delete=models.CASCADE, related_name="substitutions")
  key = models.TextField()
  value = models.TextField(blank=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["tailored_document", "key"], name="unique_tailored_document_key"),
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
    self.tailored_document.generate_docx()
    self.tailored_document.generate_png()

    if self.key not in self.tailored_document.default_substitutions:
      chat = Chat(self.tailored_document.chat_messages)
      chat.log(f"""Log: the user has updated the fillField with the key `{self.key}` to the following value:
  <saved_value>{self.value}</saved_value>.""")
      self.tailored_document.chat_messages = chat.get_messages()
      self.tailored_document.save()
  
  def regenerate(self, current_value, feedback=None):
    chat = Chat(self.tailored_document.chat_messages)

    current_value_message = ""
    if current_value != "":
      current_value_message = f"""Here is the current value of the fillField when the user pressed the \"regenerate\" button:
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
        id=self.id,
        tailored_document=self.tailored_document,
        key=self.key,
        value=response[self.key],
      )

      self.tailored_document.chat_messages = chat.get_messages()
      self.tailored_document.save()

      return substitution
    except KeyError:
      raise Exception(response["error"])
