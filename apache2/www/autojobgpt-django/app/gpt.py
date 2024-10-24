from string import Template

class Chat:
  system_message_content = "You are an experienced hiring manager using your industry knowledge to help tailor a user's resume or cover letter to a job posting."
  prompts = {
"extract_job_details":

"""
The user has provided the following text scraped from a website, which is supposed to contain a job posting.

<scraped_text>
${scraped_text}
</scraped_text>

Please extract the job title, company name and job posting from the scraped text.
If the scraped text contains more than one job posting, please extract the details from the first one.

Provide your output in JSON format with the following keys:
* job_title
* company
* job_posting -- please use \n to preserve the whitespace of the original scraped_text

If you fail to extract any of these keys, please provide a single JSON key "error" with a string value describing the error.
""",

"extract_job_technologies":

"""
The user has provided the following job posting:
<job_posting>
${job_posting}
</job_posting>

Please extract the "required" and "nice-to-have technologies" from the job posting.
The "required" technologies are the ones that are mandatory for the person performing the job, while the "nice-to-have" technologies are the ones that are not mandatory, but would be beneficial to have.
Often, the job posting will explicitly mention these technologies, but sometimes you may need to infer them from the job description.
If in doubt about whether a technology is required or nice-to-have, please include it in the "required" technologies.
If in doubt about whether to include a technology or not, please include it in the "nice-to-have" technologies.

Note by "technology" I mean the kind of technology that a software developer would list on their resume, such as a programming language, framework, library, platform, tool, or similar.
Please don't include technologies not related to software development, such as "Microsoft Word", "Excel", "PowerPoint", etc.
Also, please don't include areas of expertise, such as "machine learning", "web development", "cloud computing", etc.

Provide your output in JSON format with the following keys:
* required_technologies -- a list of strings which may be empty
* nice_to_have_technologies -- a list of strings which may be empty
There should be no overlap between the two lists.

Please use the exact names of the technologies as they are commonly referred to in the industry, including with respect to capitalization and punctuation.
For example, use "React" instead of "React.js", "Node.js" instead of "Node", "AWS" instead of "Amazon Web Services", "C#" instead of "C Sharp", "TypeScript" instead of "Typescript", etc.

If you fail to extract any of these keys, please provide a single JSON key "error" with a string value describing the error.
""",

"fill_template":

"""
The user wants to tailor their ${document_type} template. Please fill in the fill fields in the given template, tailoring the ${document_type} template to the given job details.

<template>${template_text}</template>

<job_details>
<job_title>${job_title}</job_title>
<company>${company}</company>
<job_posting>${job_posting}</job_posting>
</job_details>

<fill_fields>
${fill_fields_text}
</fill_fields>
${additional_information_text}

Provide your output in JSON format, with a JSON key for each fill field listed.

If you fail for any reason, please provide a single JSON key "error" with a string value describing the error.
""",

"regenerate_substitution_without_feedback":
"""
The user has indicated that they'd like a different value for the fill field with the key `${key}`.
They haven't provided any feedback, so you should just regenerate the fill field.

Try to make it different from the previous value, but still relevant to the previously supplied job details and template.

${current_value_message}
Provide your output in JSON format, with one JSON key for this fill field.

If you fail for any reason, please provide a single JSON key "error" with a string value describing the error.
""",

"regenerate_substitution_with_feedback":
"""
The user has indicated that they'd like a different value for the fill field with the key `${key}`.
They have provided feedback, so you should respond directly to the feedback to regenerate the fill field.

Here's the feedback that the user provided:
<feedback>${feedback}</feedback>

Make sure that the new value is still relevant to the previously supplied job details and template.

${current_value_message}
Provide your output in JSON format, with one JSON key for this fill field.

If you fail for any reason, please provide a single JSON key "error" with a string value describing the error.
""",
}
  __client = None
  response_format = { "type": "json_object" }

  @classmethod
  def get_client(cls):
    if cls.__client is None:
      from openai import OpenAI
      with open("/run/secrets/OPENAI_API_KEY") as f:
        api_key = f.read().strip()
      cls.__client = OpenAI(api_key=api_key)
    return cls.__client
    
  def __init__(self, username=None, messages=None, model_version="4-turbo-preview"):
    self.model = f"gpt-{model_version}"
    self.username = username
    if messages is None:
      self.messages = [
        {"role": "system", "content": self.system_message_content}
      ]
    else:
      self.messages = messages
  
  def ask(self, prompt_name, substitutions={}):
    client = Chat.get_client()
    prompt_text = Template(self.prompts[prompt_name]).substitute(substitutions)
    self.messages.append({"role": "user", "content": prompt_text})
    if self.username is None:
      completion = client.chat.completions.create(
        model=self.model,
        response_format=Chat.response_format,
        messages=self.messages,
      )
    else:
      completion = client.chat.completions.create(
        model=self.model,
        response_format=Chat.response_format,
        messages=self.messages,
        user=self.username,
      )
    choice = completion.choices[0]
    if choice.finish_reason != "stop":
      raise Exception(f"OpenAI API failed with status '{choice.finish_reason}'")
    else:
      message = {"role": "system", "content": choice.message.content}
      self.messages.append(message)
      return message
    
  def log(self, message):
    self.messages.append({"role": "user", "content": message})
    
  def get_messages(self):
    return self.messages
  
class ChatException(Exception):
  pass