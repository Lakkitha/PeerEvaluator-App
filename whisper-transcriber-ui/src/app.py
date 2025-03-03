from flask import Flask, request, render_template, redirect, url_for
from werkzeug.utils import secure_filename
import os
from Models.whispermodel import WhisperTranscriber

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'storage/audio'
app.config['TRANSCRIPTION_FOLDER'] = 'storage/transcriptions'
transcriber = WhisperTranscriber()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        return redirect(request.url)
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        transcription = transcriber.transcribe_audio(file_path)
        return render_template('result.html', transcription=transcription)

if __name__ == '__main__':
    app.run(debug=True)