from string import Template

prompts = {
  "extract_job_details":
"""
Here's a job posting I found online:

----

${job_posting_text}

----

Please extract the following details from the job posting.
Please give your response in JSON format with the following fields and data types:

1. key: job_title, data_type: string, description: the job title
2. key: company, data_type: string, description: the company name
""",
}

class Chat:
  myopenai = None

  def __init__(self, messages=None):
    if messages is None:
      self.messages = [
        {"role": "system", "content": "You are a helpful assistent."}
      ]
    else:
      self.messages = messages
    self.response = None
    
    import openai
    with open("/run/secrets/OPENAI_API_KEY") as f:
      openai.api_key = f.read().strip()
    self.myopenai = openai
  
  def ask(self, prompt_name, substitutions={}):
    prompt_text = Template(prompts[prompt_name]).substitute(substitutions)
    self.messages.append({"role": "user", "content": prompt_text})
    completion = self.myopenai.ChatCompletion.create(
      model = "gpt-3.5-turbo",
      messages = self.messages
    )
    choice = completion.choices[0]
    if choice.finish_reason != "stop":
      raise Exception(f"OpenAI API failed with status '{choice.finish_reason}'")
    else:
      self.response = choice.message
      return self.response.content
    
  def save_response(self):
    if self.response is not None:
      self.messages.append(self.response)
      self.response = None
      return self.messages