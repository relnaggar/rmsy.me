from string import Template

class Chat:
  system_message_content = "You are an experienced hiring manager using your industry knowledge to help tailor a resume and cover letter to a job posting."
  prompts = {
"extract_job_details":

"""
Extract the job_title and company name from this job posting.

<job_posting>
${job_text}
</job_posting>

Provide your output in JSON format with the following keys:
* job_title
* company
""",


"fill_resume_template":

"""
Fill in the fillfields in this resume_template, tailored to this job_posting.

<resume_template>
${resume_template_text}
</resume_template>

<fillfields>
${fillfields_text}
</fillfields>

Provide your output in JSON format, with JSON keys only for each of the fillfields listed above.
""",

"regenerate_substitution":
"""
I'm not happy with your output for ${key}.
Please try again, adhering to the following feedback:

<feedback>
${feedback}
</feedback>

Provide your output in JSON format, with one JSON key for this fillfield.
""",

"regenerate_resume":
"""
I'm not happy with your output for all of the fillfields.
Please try again, adhering to the following feedback:

<feedback>
${feedback}
</feedback>

Provide your output in JSON format, with a JSON key for each fillfield.
""",
}
  client = None
  model = "gpt-4"

  def __init__(self, messages=None):
    if messages is None:
      self.original_messages = []
      self.additional_messages = [
        {"role": "system", "content": self.system_message_content}
      ]
    else:
      self.original_messages = messages
      self.additional_messages = []
    
    if self.client is None:
      from openai import OpenAI
      with open("/run/secrets/OPENAI_API_KEY") as f:
        api_key = f.read().strip()
      self.client = OpenAI(api_key=api_key)

  def ask_with_messages(self, messages):
    completion = self.client.chat.completions.create(
      model=self.model,
      messages=messages,
    )
    choice = completion.choices[0]
    if choice.finish_reason != "stop":
      raise Exception(f"OpenAI API failed with status '{choice.finish_reason}'")
    else:
      return {"role": "system", "content": choice.message.content}
  
  def ask(self, prompt_name, substitutions={}):
    prompt_text = Template(self.prompts[prompt_name]).substitute(substitutions)
    self.additional_messages.append({"role": "user", "content": prompt_text})
    completion = self.client.chat.completions.create(
      model=self.model,
      messages=self.original_messages + self.additional_messages,
    )
    choice = completion.choices[0]
    if choice.finish_reason != "stop":
      raise Exception(f"OpenAI API failed with status '{choice.finish_reason}'")
    else:
      message = {"role": "system", "content": choice.message.content}
      self.additional_messages.append(message)
      return message
    
  def get_additional_messages(self):
    return self.additional_messages