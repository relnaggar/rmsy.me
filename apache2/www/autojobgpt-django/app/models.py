from django.db import models
from django.core.files import File

from json import loads
from docx import Document
from io import BytesIO
from re import findall

from .scraping import scrape_text
from .gpt import Chat


class ResumeTemplate(models.Model):
  name = models.CharField(max_length=200, primary_key=True)
  upload = models.FileField(upload_to='templates/')
  description = models.TextField(blank=True)

  def __str__(self):
    return self.name
  
class JobPostingManager(models.Manager):
  def create(self, validated_data):
    job_posting = JobPosting(url=validated_data["url"])
    job_posting.scrape()
    job_posting.extract_job_details()
    job_posting.save()
    return job_posting

class JobPosting(models.Model):
  objects = JobPostingManager()
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
    response = loads(chat.ask(prompt_name="extract_job_details", substitutions={
      "job_posting_text": self.text
    }))
    self.title = response["job_title"]
    self.company = response["company"]
    self.chat_messages = chat.get_additional_messages()

class ResumeManager(models.Manager):
  def create(self, validated_data):
    resume = Resume(template=validated_data["template"], job_posting=validated_data["job_posting"])
    substitutions = resume.fill()
    resume.save()
    for key, value in substitutions.items():
      print(f"key: {key}, value: {value}")
      ResumeSubstitution.objects.create(resume=resume, key=key, value=value)    
    return resume

class Resume(models.Model):
  objects = ResumeManager()
  template = models.ForeignKey(to=ResumeTemplate, on_delete=models.SET_NULL, null=True)
  job_posting = models.ForeignKey(to=JobPosting, on_delete=models.SET_NULL, null=True)
  upload = models.FileField(upload_to='resumes/')
  chat_messages = models.JSONField(blank=True, null=True)

  def __str__(self):
    return self.upload.name.split("/")[-1].replace(".docx", "")

  def fill(self):
    default_substitutions = {
      "JOB_TITLE": self.job_posting.title,
      "COMPANY": self.job_posting.company,
    }

    # open the template with docx
    template_document = Document(self.template.upload.path)
    
    # extract all text from the template
    template_paragraphs = []
    for paragraph in template_document.paragraphs:
      template_paragraphs.append(paragraph.text)
    template_text = "\n".join(template_paragraphs)

    # extract all the fillfields from the template text
    # fillfields are in the format {{key}}
    fillfield_keys = findall(r"{{(.*?)}}", template_text)
    for default_key in default_substitutions.keys():
      fillfield_keys.remove(default_key)

    # construct the fillfields_text part of the prompt    
    fillfields_text = ""
    for i, key in enumerate(fillfield_keys):
      fillfield = ResumeFillField.objects.get(key=key)
      fillfields_text += f"{i+1}. key: {key}, data_type: {fillfield.data_type}, description: {fillfield.description}\n"

    # ask ChatGPT to fill in the fillfields
    chat = Chat(self.job_posting.chat_messages)
    response = loads(chat.ask(prompt_name="extract_custom_fillfields", substitutions={
      "resume_template_text": template_text,
      "fillfields_text": fillfields_text
    }))

    # validate the response by checking that all the fillfields are present
    custom_substitutions = {}
    for key in fillfield_keys:
      custom_substitutions[key] = response[key]

    # substitute the fillfields into the template document
    substitutions = default_substitutions | custom_substitutions
    for para in template_document.paragraphs:
      for run in para.runs:
        for key, value in substitutions.items():
          if "{{" + key + "}}" in run.text:
            run.text = run.text.replace("{{" + key + "}}", value)

    # save the document to file stream
    file_stream = BytesIO()
    template_document.save(file_stream)
    
    # save the file stream to the file field
    file_name = f"{self.job_posting}_{self.template}.docx"    
    self.upload.save(file_name, File(file_stream))

    # save the chat messages
    self.chat_messages = chat.get_additional_messages()

    return custom_substitutions

  # def to_pdf(self):
  #   # old method from command-line application
  #   from docx2pdf import convert
  #   import os
  #   from pypdf import PdfReader

  #   # save the resume as a .pdf file
  #   filepath_pdf = self.filepath.replace(".docx", ".pdf")    
  #   tmp_filepath = "tmp.docx"
  #   os.system(f"cp {self.filepath} {tmp_filepath}")
  #   convert(tmp_filepath, filepath_pdf)
  #   os.remove(tmp_filepath)

  #   # check that the .pdf resume has only 1 page
  #   reader = PdfReader(filepath_pdf)
  #   number_of_pages = len(reader.pages)
  #   if number_of_pages > 1:
  #     raise Exception(f"tailored resume has {number_of_pages} pages, but should have only 1 page")

class ResumeFillField(models.Model):
  key = models.CharField(max_length=200, primary_key=True)
  data_type = models.CharField(max_length=7)
  description = models.TextField()

  def __str__(self):
    return f"{self.key}"
  
class ResumeSubstitution(models.Model):
  resume = models.ForeignKey(to=Resume, on_delete=models.CASCADE, related_name="substitutions")
  key = models.CharField(max_length=200)
  value = models.TextField()
  version = models.IntegerField(default=1)
  chat_messages = models.JSONField(blank=True, null=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=['resume', 'key', 'value', 'version'], name='unique_resume_key_value_version'),
    ]

  def __str__(self):
    return f"{self.key}: {self.value} for {self.resume}, version {self.version}"
  
  def regenerate(self, feedback):
    if self.chat_messages is None:
      chat_messages = []
    else:
      chat_messages = self.chat_messages
    chat = Chat(self.resume.job_posting.chat_messages + self.resume.chat_messages + chat_messages)
    response = loads(chat.ask(prompt_name="regenerate_substitution", substitutions={
      "key": self.key,
      "feedback": feedback
    }))
    return ResumeSubstitution.objects.create(
      resume=self.resume,
      key=self.key,
      value=response[self.key],
      version=self.version+1,
      chat_messages=chat_messages + chat.get_additional_messages()
    )
