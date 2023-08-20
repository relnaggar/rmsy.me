import json
from string import Template

from django.db import models
from django.db.utils import IntegrityError
from django.shortcuts import get_object_or_404

from .scraping import scrape_text
from .gpt import Chat


class JobPosting(models.Model):
  url = models.URLField(unique=True)
  title = models.CharField(max_length=26, blank=True, null=True)
  company = models.CharField(max_length=26, blank=True, null=True)
  text = models.TextField(blank=True)
  error = models.TextField(blank=True)
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
    self.save()

  def resolve(self):
    self.error = ""
    self.save()

  def extract(self):
    chat = Chat()
    response = chat.ask(Template(Prompt.objects.get(name="extract").text).substitute({
      "job_posting_text": self.text
    }))    
    try:
      answer = json.loads(response)
      self.title = answer["job_title"]
      self.company = answer["company"]
      self.save()
      # JobRequirement.objects.filter(job_posting=self).delete()
      # for jobrequirement in answer["skills"]:
      #   JobRequirement(job_posting=self, text=jobrequirement).save()   
      self.chat_messages = chat.save_response()
    except json.decoder.JSONDecodeError as e:
      self.error = f"{type(e)}: {e}"
    except (KeyError, IntegrityError) as e:
      self.title = None
      self.company = None
      self.error = f"{type(e)}: {e}" 
    self.save()

class JobRequirement(models.Model):
  job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
  text = models.TextField()

class Prompt(models.Model):
  name = models.CharField(max_length=200, primary_key=True)
  text = models.TextField()

  def __str__(self):
    return self.name