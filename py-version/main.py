from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def home(request):
    if request.method == "POST":
        pass
    return render_template('submit.html')