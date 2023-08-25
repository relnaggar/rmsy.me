from django.db import models
from django.core.files import File
from django.utils import timezone

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
  
  def open_document(self):
    # open the template with docx
    return Document(self.upload.path)
  
  def extract_text(self):
    # open the template with docx
    document = self.open_document()
    
    # extract all text from the template
    paragraphs = []
    for paragraph in document.paragraphs:
      paragraphs.append(paragraph.text)
    return "\n".join(paragraphs)
  
  def extract_fillfields(self, text=None):
    if text is None:
      text = self.extract_text()

    # extract all the fillfields from the template text
    # fillfields must be in the format {{key}}
    return findall(r"{{(.*?)}}", text)


class FillField(models.Model):
  key = models.CharField(max_length=200, primary_key=True)
  data_type = models.CharField(max_length=7)
  description = models.TextField()

  def __str__(self):
    return f"{self.key}"


class JobManager(models.Manager):
  def create(self, validated_data):
    job = Job(url=validated_data["url"])
    job.scrape()
    job.extract_job_details()
    job.save()
    return job

class Job(models.Model):
  objects = JobManager()
  url = models.URLField(unique=True)
  title = models.CharField(max_length=26, blank=True)
  company = models.CharField(max_length=26, blank=True)
  text = models.TextField(blank=True)
  chat_messages = models.JSONField(blank=True, null=True)
  resume_template = models.ForeignKey(to="ResumeTemplate", on_delete=models.SET_NULL, null=True, blank=True)
  date_applied = models.DateTimeField(blank=True, null=True)
  chosen_resume = models.ForeignKey(to="Resume", on_delete=models.SET_NULL, null=True, blank=True, related_name="chosen_jobs")
  status = models.CharField(max_length=26, blank=True) # "backlog", "applying", "pending", "testing", "interviewing", "rejected", "accepted"

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
      "job_text": self.text,
    }))
    self.title = response["job_title"]
    self.company = response["company"]
    self.chat_messages = chat.get_additional_messages()

  def apply(self, chosen_resume):
    self.date_applied = timezone.now()
    self.chosen_resume = chosen_resume
    self.status = "pending"
    self.save()
  
  def set_status(self, status):
    self.status = status
    self.save()

class Resume(models.Model):
  job = models.ForeignKey(to="Job", on_delete=models.CASCADE, related_name="resumes")  
  version = models.IntegerField(default=1)
  upload = models.FileField(upload_to='resumes/')
  chat_messages = models.JSONField(blank=True, null=True)

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=['job', 'version'], name='unique_job_version'),
    ]

  def __str__(self):
    return self.upload.name.split("/")[-1].replace(".docx", "")
  
  @property
  def default_substitutions(self):
    return {
      "JOB_TITLE": self.job.title,
      "COMPANY": self.job.company,
    }

  @property
  def is_filled(self):
    return self.substitutions.count() > 0
  
  @property
  def has_docx(self):
    return self.upload.name.endswith(".docx")
  
  def get_next_version(self):
    return Resume.objects.filter(job=self.job).aggregate(models.Max('version'))["version__max"] + 1

  def _remove_default_substitutions(self, fillfield_keys):
    for default_key in self.default_substitutions.keys():
      if default_key in fillfield_keys:
        fillfield_keys.remove(default_key)

  def _validate_response_and_get_substitutions(self, response, fillfield_keys):
    # validate the response by checking that all the fillfields are present
    substitutions = {}
    for key in fillfield_keys:
      substitutions[key] = response[key]
    return substitutions
  
  def _create_resume_substitutions(resume, substitutions):
    # create the resume substitutions
    for key, value in substitutions.items():
      ResumeSubstitution.objects.create(
        resume=resume,
        key=key,
        value=value,
      )

  def _create_new_resume_and_substitutions(self, substitutions, chat_messages):
    # create the new resume
    new_resume = Resume.objects.create(
      job=self.job,
      version=self.get_next_version(),
      chat_messages=chat_messages,
    )
    self._create_resume_substitutions(new_resume, substitutions)
    return new_resume

  def fill(self):
    if self.is_filled:
      raise Exception("you can only fill a resume once")
    
    template_text = self.job.resume_template.extract_text()
    fillfield_keys = self.job.resume_template.extract_fillfields(text=template_text)
    self._remove_default_substitutions(fillfield_keys)
    
    # construct the fillfields_text part of the prompt    
    fillfields_text = ""
    for key in fillfield_keys:
      fillfield = FillField.objects.get(key=key)
      if fillfield is None:
        raise Exception(f"fillfield {key} not found")
      fillfields_text +=\
f"""<fillfield>
  <key>{key}</key>
  <data_type>{fillfield.data_type}</data_type>
  <description>
{fillfield.description}
  </description>
</fillfield>\n"""

    # ask GPT to fill in the fillfields
    chat = Chat(self.job.chat_messages)
    response = loads(chat.ask(prompt_name="fill_resume_template", substitutions={
      "resume_template_text": template_text,
      "fillfields_text": fillfields_text,
    }))

    substitutions = self._validate_response_and_get_substitutions(response, fillfield_keys)

    # save the chat messages 
    self.chat_messages = chat.get_additional_messages()
    self.save()

    self._create_resume_substitutions(self, substitutions)

  def generate_docx(self):
    if not self.is_filled:
      raise Exception("you have to fill the resume with .fill() before you can generate the docx file")
    if self.has_docx:
      raise Exception("you can only generate the docx file once")

    # open the template with docx
    template_document = self.job.resume_template.open_document()

    # get all the fillfields
    all_substitutions = self.default_substitutions
    for resume_substitution in self.substitutions.all():
      all_substitutions[resume_substitution.key] = resume_substitution.value

    # substitute the fillfields into the template document
    for para in template_document.paragraphs:
      for run in para.runs:
        for key, value in all_substitutions.items():
          if "{{" + key + "}}" in run.text:
            run.text = run.text.replace("{{" + key + "}}", value)

    # save the document to file stream
    file_stream = BytesIO()
    template_document.save(file_stream)
    
    # save the file stream to the file field
    file_name = f"{self.job}_{self.version}.docx"    
    self.upload.save(file_name, File(file_stream))   

  def regenerate(self, feedback=None):
    if not self.is_filled:
      raise Exception("you have to fill the resume with .fill() before you can regenerate the resume")
    
    if feedback is None:
      return self._regenerate_without_feedback()
    else:
      return self._regenerate_with_feedback(feedback)

  def _regenerate_without_feedback(self):    
    # the expected fillfields are the keys of the most recent response
    fillfield_keys = list(loads(self.chat_messages[-1]['content']).keys())
    self._remove_default_substitutions(fillfield_keys)    

    # re-ask GPT the most recent question
    chat_messages_rewinded_1 = self.chat_messages[:-1]
    chat_message = Chat().ask_with_messages(self.job.chat_messages + chat_messages_rewinded_1)
    response = loads(chat_message.content)

    substitutions = self._validate_response_and_get_substitutions(response, fillfield_keys)
    new_resume = self._create_new_resume_and_substitutions(substitutions, chat_messages_rewinded_1 + [chat_message])

    # copy the resume substitutions from the previous resume
    for key in self.job.resume_template.extract_fillfields():
      if key not in fillfield_keys and key not in self.default_substitutions.keys():
        # copy the resume substitution
        old_resume_substitution = self.substitutions.get(key=key)
        ResumeSubstitution.objects.create(
          resume=new_resume,
          key=old_resume_substitution.key,
          value=old_resume_substitution.value,
        )
    
    return new_resume

  def _regenerate_with_feedback(self, feedback):
    chat = Chat(self.job.chat_messages + self.chat_messages)
    response = loads(chat.ask(prompt_name="regenerate_resume", substitutions={
      "feedback": feedback,
    }))

    fillfield_keys = self.job.resume_template.extract_fillfields()
    self._remove_default_substitutions(fillfield_keys)
    substitutions = self._validate_response_and_get_substitutions(response, fillfield_keys)

    return self._create_new_resume_and_substitutions(substitutions, self.chat_messages+chat.get_additional_messages())

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


class ResumeSubstitution(models.Model):
  resume = models.ForeignKey(to="Resume", on_delete=models.CASCADE, related_name="substitutions")
  key = models.CharField(max_length=200)
  value = models.TextField()

  class Meta:
    constraints = [
      models.UniqueConstraint(fields=['resume', 'key', 'value'], name='unique_resume_key_value'),
    ]

  def __str__(self):
    return f"{self.key}: {self.value} for {self.resume}"
  
  def _regenerate_without_feedback(self):
    # re-ask GPT the most recent question
    chat_messages_rewinded_1 = self.chat_messages[:-1]
    chat_message = Chat().ask_with_messages(self.resume.job.chat_messages + self.resume.chat_messages + chat_messages_rewinded_1)
    response = loads(chat_message.content)
    new_resume = Resume.objects.create(
      job=self.resume.job,
      version=self.resume.get_next_version(),
      chat_messages=self.resume.chat_messages + chat_messages_rewinded_1 + [chat_message],
    )
    for resume_substitution in self.resume.substitutions.all():
      if resume_substitution.key != self.key:
        ResumeSubstitution.objects.create(
          resume=new_resume,
          key=resume_substitution.key,
          value=resume_substitution.value,
        )
    return ResumeSubstitution.objects.create(
      resume=new_resume,
      key=self.key,
      value=response[self.key],
    )


  def regenerate(self, feedback):
    chat = Chat(self.resume.job.chat_messages + self.resume.chat_messages)
    response = loads(chat.ask(prompt_name="regenerate_substitution", substitutions={
      "key": self.key,
      "feedback": feedback,
    }))

    # copy the resume and its substitutions
    new_resume = Resume.objects.create(
      job=self.resume.job,
      version=self.resume.get_next_version(),
      chat_messages=self.resume.chat_messages + chat.get_additional_messages(),
    )
    for resume_substitution in self.resume.substitutions.all():
      if resume_substitution.key != self.key:
        ResumeSubstitution.objects.create(
          resume=new_resume,
          key=resume_substitution.key,
          value=resume_substitution.value,
        )
    return ResumeSubstitution.objects.create(
      resume=new_resume,
      key=self.key,
      value=response[self.key],
    )