from django.db import models
from django.core.files import File


from docx import Document
from io import BytesIO

from .scraping import scrape_text
from .gpt import Chat


class ResumeTemplate(models.Model):
  name = models.CharField(max_length=200, primary_key=True)
  upload = models.FileField(upload_to='templates/')
  description = models.TextField(blank=True)

  def __str__(self):
    return self.name

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
    response = chat.ask(prompt_name="extract_job_details", substitutions={
      "job_posting_text": self.text
    })
    self.title = response["job_title"]
    self.company = response["company"]
    self.chat_messages = chat.save_response()

class Resume(models.Model):
  template = models.ForeignKey(to=ResumeTemplate, on_delete=models.SET_NULL, null=True)
  job_posting = models.ForeignKey(to=JobPosting, on_delete=models.SET_NULL, null=True)
  upload = models.FileField(upload_to='resumes/')

  def fill(self):
    # default replacements
    replacements = {
      "JOB_TITLE": self.job_posting.title,
      "COMPANY": self.job_posting.company,
    }

    # open the template with docx
    document = Document(self.template.upload.path)

    # replace the placeholders with the job details
    for para in document.paragraphs:
      for run in para.runs:
        for key, value in replacements.items():
          if "{{" + key + "}}" in run.text:
            run.text = run.text.replace("{{" + key + "}}", value)

    # save to file stream
    file_stream = BytesIO()
    document.save(file_stream)
    
    # save to file field
    file_name = f"{self.job_posting}_{self.template}.docx"    
    self.upload.save(file_name, File(file_stream))
  
  def __str__(self):
    return self.upload.name.split("/")[-1].replace(".docx", "")

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