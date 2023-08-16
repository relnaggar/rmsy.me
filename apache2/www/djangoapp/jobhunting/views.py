from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "jobhunting/index.html", {})

def hello(request):
    import openai
    import time

    with open("/run/secrets/OPENAI_API_KEY") as f:
        openai.api_key = f.read().strip()

    messages = [
        {"role": "system", "content": "You are an experienced software engineering hiring manager."},
        {"role": "user", "content": "Hello, I'm Ramsey, a software engineer. How can I construct the best resume?"},
    ]
    start_time = time.time()
    completion = openai.ChatCompletion.create(
        model = "gpt-3.5-turbo",
        messages = messages
    )
    duration = time.time() - start_time
    messages.append(completion.choices[0].message)
    return render(request, "jobhunting/hello.html", {
        "message": messages[-1].content,
        "duration": duration
    })