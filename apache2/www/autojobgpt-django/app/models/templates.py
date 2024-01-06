from django.db import models
from django.conf import settings

import re
import os

from .documents import DocumentMixin, DocumentType
from ..gpt import Chat


DEFAULT_FILLFIELDS = {
  "JOB_TITLE": "The job title.",
  "COMPANY": "The company name.",
}

class FillField(models.Model):
  user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fill_fields")
  template = models.ForeignKey(to="Template", on_delete=models.CASCADE, related_name="fill_fields")
  key = models.CharField(max_length=200)
  description = models.TextField(blank=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["user", "template", "key"], name="fill_field_unique_template_key"),
    ]

  def __str__(self):
    return f"{self.key}"
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    super().save(*args, **kwargs)
  
  def __update(self, *args, **kwargs):
    if self.key in DEFAULT_FILLFIELDS:
      raise ValueError(f"fill field with the key `{self.key}` is read-only.")

    super().save(*args, **kwargs)
    for tailored_document in self.template.tailored_documents.all():
      chat = Chat(self.user.username, tailored_document.chat_messages)
      chat.log(f"""Log: the user has updated the fill field with the key `{self.key}` to have the following description:
  <description>{self.description}</description>.""")
      tailored_document.chat_messages = chat.get_messages()
      tailored_document.save()

class Template(models.Model, DocumentMixin):  
  user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="templates")
  docx = models.FileField(upload_to="templates/")
  png = models.FileField(upload_to="templates/")
  name = models.TextField()
  additional_information = models.TextField(blank=True)
  type = models.CharField(max_length=20, choices=DocumentType.choices)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["user", "name", "type"], name="template_unique_name_type"),
    ]

  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    super().save(*args, **kwargs)
    fill_field_keys = self.extract_fill_field_keys()
    for key in fill_field_keys:
      if key in DEFAULT_FILLFIELDS.keys():
        description = DEFAULT_FILLFIELDS[key]
      else:
        description = ""
      if not FillField.objects.filter(template=self, key=key).exists():
        FillField.objects.create(
          user=self.user,
          key=key,
          description=description,
          template=self,
        )
    self.generate_png()

  def __update(self, *args, **kwargs):
    original_additional_information = Template.objects.get(pk=self.pk).additional_information

    # if the additional_information has changed, update the chat messages
    if self.additional_information != original_additional_information:
      for tailored_document in self.tailored_documents.all():
        chat = Chat(self.user.username, tailored_document.chat_messages)
        chat.log(f"""Log: the user has updated their additional information to be:
<additional_information>{self.additional_information}</additional_information>.""")
        tailored_document.chat_messages = chat.get_messages()
        tailored_document.save()

    super().save(*args, **kwargs)


  def delete(self, *args, **kwargs):    
    super().delete(*args, **kwargs)
    os.remove(self.docx.path)
    os.remove(self.png.path)
  
  def extract_fill_field_keys(self, text=None, include_default=True):
    if text is None:
      text = self.extract_text()

    # extract all the fill fields from the template text
    # fill fields must be in the format {{key}}
    fill_field_keys = re.findall(r"{{(.*?)}}", text)

    if include_default:
      return fill_field_keys
    else:
      return [key for key in fill_field_keys if key not in DEFAULT_FILLFIELDS]
