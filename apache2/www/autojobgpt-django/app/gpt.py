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


"fill_resume_template":

"""
Fill in the fillFields in the given resume template, tailoring the resume to the given job details.

<resume_template>${resume_template_text}</resume_template>

<job_details>
<job_title>${job_title}</job_title>
<company>${company}</company>
<job_posting>${job_posting}</job_posting>
</job_details>

<fillFields>
${fillFields_text}
</fillFields>

Provide your output in JSON format, with a JSON key for each fillField listed.

If you fail for any reason, please provide a single JSON key "error" with a string value describing the error.
""",

"regenerate_substitution_without_feedback":
"""
The user has indicated that they'd like a different value for the fillField with the key `${key}`.
They haven't provided any feedback, so you should just regenerate the fillField.

Try to make it different from the previous value, but still relevant to the previously supplied job details and resume template.

${current_value_message}
Provide your output in JSON format, with one JSON key for this fillField.

If you fail for any reason, please provide a single JSON key "error" with a string value describing the error.
""",

"regenerate_substitution_with_feedback":
"""
The user has indicated that they'd like a different value for the fillField with the key `${key}`.
They have provided feedback, so you should respond directly to the feedback to regenerate the fillField.

Here's the feedback that the user provided:
<feedback>${feedback}</feedback>

Make sure that the new value is still relevant to the previously supplied job details and resume template.

${current_value_message}
Provide your output in JSON format, with one JSON key for this fillField.

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

  @staticmethod
  def ask_again(messages):
    client = Chat.get_client()
    completion = client.chat.completions.create(
      model=Chat.model,
      response_format=Chat.response_format,
      messages=messages,
    )
    choice = completion.choices[0]
    if choice.finish_reason != "stop":
      raise Exception(f"OpenAI API failed with status '{choice.finish_reason}'")
    else:
      return {"role": "system", "content": choice.message.content}
    
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