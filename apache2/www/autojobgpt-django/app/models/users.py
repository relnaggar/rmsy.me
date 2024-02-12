from django.contrib.auth.models import AbstractUser
from django.contrib.admin.models import LogEntry, ADDITION
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from rest_framework.authtoken.models import Token

from .documents import DocumentType


class CustomUser(AbstractUser):
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    demo = CustomUser.objects.filter(username='demo').first()
    with transaction.atomic():
      super().save(*args, **kwargs)
      Token.objects.create(user=self)
      LogEntry.objects.log_action(
        user_id=CustomUser.objects.get(username='root').pk,
        content_type_id=ContentType.objects.get_for_model(self).pk,
        object_id=self.pk,
        object_repr=str(self),
        action_flag=ADDITION,
        change_message='Created'
      )
      if demo:
        content_types = ["statuses", "jobs", "templates", "fill_fields", "tailored_documents", "substitutions"]
        for content_type in content_types:
          demo_items = list(getattr(demo, content_type).all())
          cloned_items = []
          for item in demo_items:
            item.pk = None
            item.user = self
            if content_type == "jobs":
              item.status = self.statuses.get(name=item.status.name)
            elif content_type == "fill_fields":
              item.template = self.templates.get(name=item.template.name, type=item.template.type)
            elif content_type == "tailored_documents":
              item.template = self.templates.get(name=item.template.name, type=item.template.type)
              item.job = self.jobs.get(title=item.job.title, company=item.job.company)
            elif content_type == "substitutions":
              item.tailored_document = self.tailored_documents.get(name=item.tailored_document.name, type=item.tailored_document.type)
            cloned_items.append(item)          
          demo_items[0].__class__.objects.bulk_create(cloned_items, batch_size=100)

        for job in self.jobs.all():
          matching_demo_job = demo.jobs.get(title=job.title, company=job.company)
          job.chosen_resume = self.tailored_documents.filter(name=matching_demo_job.chosen_resume.name, type=DocumentType.RESUME).first()
          job.save()
  
  def __update(self, *args, **kwargs):
    super().save(*args, **kwargs)