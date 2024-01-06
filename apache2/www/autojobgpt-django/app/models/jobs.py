from django.db import models
from django.db import transaction
from django.conf import settings

import json

from ..scraping import scrape_text
from ..gpt import Chat


class Status(models.Model):  
  user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="statuses")
  name = models.TextField()
  order = models.IntegerField()

  class Meta:
    verbose_name_plural = "Statuses"

    constraints = [
      models.UniqueConstraint(
        fields=["user", "name"],
        name="status_unique_name"),
    ]
  
  def __str__(self):
    return self.name
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    try:
      self.order = Status.objects.filter(user=self.user).latest("order").order + 1
    except Status.DoesNotExist:
      self.order = 1
    super().save(*args, **kwargs)

  def __update(self, *args, **kwargs):
    current_status = Status.objects.get(pk=self.pk)    
    if self.order != current_status.order:
      try:
        status_to_swap = Status.objects.filter(user=self.user).get(order=self.order)
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
      higher_order_statuses = Status.objects.filter(user=self.user, order__gt=self.order)
      higher_order_statuses.update(order=models.F("order") - 1)
      super().delete(*args, **kwargs)

class Job(models.Model):
  @staticmethod
  def extract_details_from_url(url):
    scraped_text = scrape_text(url)
    message = Chat().ask(prompt_name="extract_job_details", substitutions={"scraped_text": scraped_text})
    response = json.loads(message["content"])
    try:
      title = response["job_title"]
      company = response["company"]
      posting = response["job_posting"]
      return title, company, posting
    except KeyError:
      raise Exception(response["error"])
  
  user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="jobs")
  url = models.URLField(blank=True)
  title = models.TextField()
  company = models.TextField()
  posting = models.TextField()
  status = models.ForeignKey(to="Status", on_delete=models.RESTRICT, related_name="jobs")
  chosen_resume = models.ForeignKey(to="TailoredDocument", on_delete=models.SET_NULL, related_name="jobs", null=True, blank=True)
  notes = models.TextField(blank=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(
        fields=["user", "title", "company"],
        name="job_unique_title_company"),
    ]

  def __str__(self):
    return f"{self.title}, {self.company}"
  
  def save(self, *args, **kwargs):
    if not self.pk:
      self.__create(*args, **kwargs)
    else:
      self.__update(*args, **kwargs)

  def __create(self, *args, **kwargs):
    try:
      self.status = Status.objects.filter(user=self.user).get(order=1)
    except Status.DoesNotExist:
      self.status = Status.objects.create(user=self.user, name="Backlog", order=1)
    super().save(*args, **kwargs)
  
  def __update(self, *args, **kwargs):
    super().save(*args, **kwargs)
