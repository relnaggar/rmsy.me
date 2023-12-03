from django.db import models

import json

from ..scraping import scrape_text
from ..gpt import Chat


class Job(models.Model):
  url = models.URLField(blank=True)
  title = models.TextField()
  company = models.TextField()
  posting = models.TextField()
  status = models.TextField()
  # date_applied = models.DateTimeField(null=True, blank=True, default=timezone.now)
  # chosen_resume = models.ForeignKey(to="Resume", on_delete=models.SET_NULL, null=True, blank=True)

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
