from django.db import models

import re
import os

from .documents import DocumentMixin, DocumentType
from ..gpt import Chat


DEFAULT_FILLFIELDS = {
  "JOB_TITLE": "The job title.",
  "COMPANY": "The company name.",
}

class FillField(models.Model):
  template = models.ForeignKey(
    to="Template",
    on_delete=models.CASCADE,
    related_name="fillFields",
  )
  key = models.CharField(max_length=200)
  description = models.TextField(blank=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["template", "key"], name="fill_field_unique_template_key"),
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
      raise ValueError(f"FillField with the key `{self.key}` is read-only.")

    super().save(*args, **kwargs)
    for tailored_document in self.template.tailoredDocuments.all():
      chat = Chat(tailored_document.chat_messages)
      chat.log(f"""Log: the user has updated the fillField with the key `{self.key}` to have the following description:
  <description>{self.description}</description>.""")
      tailored_document.chat_messages = chat.get_messages()
      tailored_document.save()

class Template(models.Model, DocumentMixin):  
  docx = models.FileField(upload_to="templates/")
  png = models.FileField(upload_to="templates/")
  name = models.TextField()
  description = models.TextField(blank=True)
  type = models.CharField(max_length=20, choices=DocumentType.choices)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=["name", "type"], name="template_unique_name_type"),
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
    fillField_keys = self.extract_fillField_keys()
    for key in fillField_keys:
      if key in DEFAULT_FILLFIELDS.keys():
        description = DEFAULT_FILLFIELDS[key]
      else:
        description = ""
      if not FillField.objects.filter(template=self, key=key).exists():
        FillField.objects.create(
          key=key,
          description=description,
          template=self,
        )
    self.generate_png()

  def __update(self, *args, **kwargs):
    super().save(*args, **kwargs)

  def delete(self, *args, **kwargs):
    os.remove(self.docx.path)
    os.remove(self.png.path)
    super().delete(*args, **kwargs)
  
  def extract_fillField_keys(self, text=None, include_default=True):
    if text is None:
      text = self.extract_text()

    # extract all the fillFields from the template text
    # fillFields must be in the format {{key}}
    fillField_keys = re.findall(r"{{(.*?)}}", text)

    if include_default:
      return fillField_keys
    else:
      return [key for key in fillField_keys if key not in DEFAULT_FILLFIELDS]
