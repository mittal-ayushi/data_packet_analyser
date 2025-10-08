from flask import Flask, render_template, request, redirect, url_for
import os
from analysis import generate_report

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_files():
    files = request.files.getlist("files")

    for i, file in enumerate(files, start=1):
        if file.filename:
            filename = f"message_{i}{os.path.splitext(file.filename)[1]}"
            path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(path)

    # redirect to /analysis after upload
    return redirect(url_for("analysis"))

@app.route("/analysis")
def analysis():
    # generate the updated report dynamically
    html_output = generate_report("uploads")
    return html_output  # render the report

if __name__ == "__main__":
    app.run(debug=True)
