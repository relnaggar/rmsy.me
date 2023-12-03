from django.db import models
from django.utils import timezone

import json

from ..scraping import scrape_text
from ..gpt import Chat


class Job(models.Model):
  url = models.URLField(blank=True)
  title = models.TextField()
  company = models.TextField()
  posting = models.TextField()
  status = models.TextField()

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
