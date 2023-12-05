from django.db import models
from django.db import transaction

import json

from ..scraping import scrape_text
from ..gpt import Chat

class Status(models.Model):
  @staticmethod
  def get_default():
    try:
      return Status.objects.get(order=1).pk
    except Status.DoesNotExist:
      return Status.objects.create(name="Backlog", order=1).pk

  def get_default_order():
    try:
      return Status.objects.latest('order').order + 1
    except Status.DoesNotExist:
      return 1

  name = models.TextField(unique=True)
  order = models.IntegerField(default=get_default_order)
  
  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    super().save(*args, **kwargs)

  def __update(self, *args, **kwargs):
    current_status = Status.objects.get(pk=self.pk)    
    if self.order != current_status.order:
      try:
        status_to_swap = Status.objects.get(order=self.order)
        status_to_swap.order = current_status.order
        with transaction.atomic():
          super(Status, status_to_swap).save(*args, **kwargs)
          super().save(*args, **kwargs)
      except Status.DoesNotExist:
        raise Exception(f"Status with order {self.order} does not exist")
    else:
      super().save(*args, **kwargs)

  def delete(self, *args, **kwargs):
    with transaction.atomic():
      higher_order_statuses = Status.objects.filter(order__gt=self.order)
      higher_order_statuses.update(order=models.F('order') - 1)
      super().delete(*args, **kwargs)

class Job(models.Model):
  url = models.URLField(blank=True)
  title = models.TextField()
  company = models.TextField()
  posting = models.TextField()
  status = models.ForeignKey(to="Status", on_delete=models.RESTRICT, related_name="jobs", default=Status.get_default)

  class Meta:
    constraints = [
      models.UniqueConstraint(
        fields=['title', 'company'],
        name='unique_title_company'),
    ]

  def __str__(self):
    return f"{self.title}, {self.company}"

  @staticmethod
  def extract_details_from_url(url):
    posting = scrape_text(url)
    message = Chat().ask(prompt_name="extract_job_details", substitutions={"job_posting": posting})
    response = json.loads(message["content"])
    try:
      title = response["job_title"]
      company = response["company"]
      return title, company, posting
    except KeyError:
      raise Exception(response["error"])
