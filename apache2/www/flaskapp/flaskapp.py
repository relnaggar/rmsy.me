from flask import Flask

app = Flask(__name__)

app.config["APPLICATION_ROOT"] = "/flaskapp"

@app.route("/")
def hello_world():
    return "Hello, Buddy!"

@app.route("/test")
def test_route():
    return "Test Page"