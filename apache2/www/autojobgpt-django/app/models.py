from django.db import models

from json import loads

from .scraping import scrape_text
from .gpt import Chat


class ResumeTemplate(models.Model):
    name = models.CharField(max_length=200, primary_key=True)
    upload = models.FileField(upload_to='templates/')
    description = models.TextField(blank=True)

class JobPosting(models.Model):
  url = models.URLField(unique=True)
  title = models.CharField(max_length=26, blank=True)
  company = models.CharField(max_length=26, blank=True)
  text = models.TextField(blank=True)
  chat_messages = models.JSONField(blank=True, null=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=['title', 'company'], name='unique_title_company'),
    ]

  def __str__(self):
    if self.title is None or self.company is None:
      return self.url
    else:
      return f"{self.title}, {self.company}"

  def scrape(self):    
    self.text = scrape_text(self.url)

  def extract_job_details(self):
    chat = Chat()
    response = chat.ask("extract_job_details", {
      "job_posting_text": self.text
    })
    answer = loads(response)
    self.title = answer["job_title"]
    self.company = answer["company"]
    self.chat_messages = chat.save_response()