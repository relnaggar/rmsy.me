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
  
  def ask(self, prompt):
    self.messages.append({"role": "user", "content": prompt})
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