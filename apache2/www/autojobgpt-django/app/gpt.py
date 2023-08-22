from string import Template

prompts = {

"extract_job_details":

"""
Extract the job_title and company_name from this job posting.

<job_posting>
${job_posting_text}
</job_posting>

Provide your output in JSON format with the following keys:
key: job_title, data_type: string
key: company_name, data_type: string
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

Provide your output in JSON format, with a JSON key for each fillfield.
""",

"regenerate_fillfield":
"""
I'm not happy with your output for ${key}.
Please try again, adhering to the following feedback:

<feedback>
${feedback}
</feedback>

Provide your output in JSON format, with one JSON key for this fillfield.
"""
}

class Chat:
  myopenai = None

  def __init__(self, messages=None):
    if messages is None:
      self.original_messages = []
      self.additional_messages = [
        {"role": "system", "content": "You are an experienced hiring manager using your industry to knowledge to help tailor a resume and cover letter to a job posting."}
      ]
    else:
      self.original_messages = messages
      self.additional_messages = []
    
    import openai
    with open("/run/secrets/OPENAI_API_KEY") as f:
      openai.api_key = f.read().strip()
    self.myopenai = openai
  
  def ask(self, prompt_name, substitutions={}):
    prompt_text = Template(prompts[prompt_name]).substitute(substitutions)
    self.additional_messages.append({"role": "user", "content": prompt_text})
    completion = self.myopenai.ChatCompletion.create(
      model = "gpt-4",
      messages = self.original_messages + self.additional_messages,
    )
    choice = completion.choices[0]
    if choice.finish_reason != "stop":
      raise Exception(f"OpenAI API failed with status '{choice.finish_reason}'")
    else:
      self.additional_messages.append(choice.message)
      return self.additional_messages[-1].content
    
  def get_additional_messages(self):
    return self.additional_messages