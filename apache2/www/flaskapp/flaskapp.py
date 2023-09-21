from flask import Flask, render_template

app = Flask(__name__)

app.config["APPLICATION_ROOT"] = "/flaskapp"

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/api')
def api():
    return {
        "sucess": True,
    }