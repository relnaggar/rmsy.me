from string import Template

class Chat:
  system_message_content = "You are an experienced hiring manager using your industry knowledge to help tailor a user's resume or cover letter to a job posting."
  prompts = {
"extract_job_details":

"""
Extract the job title and company name from the given job posting.

<job_posting>
${job_posting}
</job_posting>

Provide your output in JSON format with the following keys:
* job_title
* company

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
  model = "gpt-4-1106-preview"
  response_format = { "type": "json_object" }

  @classmethod
  def get_client(cls):
    if cls.__client is None:
      from openai import OpenAI
      with open("/run/secrets/OPENAI_API_KEY") as f:
        api_key = f.read().strip()
      cls.__client = OpenAI(api_key=api_key)
    return cls.__client
    
  def __init__(self, messages=None):
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
    completion = client.chat.completions.create(
      model=Chat.model,
      response_format=Chat.response_format,
      messages=self.messages,
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