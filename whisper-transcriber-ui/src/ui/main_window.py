from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QLabel, QLineEdit, QFileDialog, QVBoxLayout, QWidget
from PyQt5.QtCore import Qt
from Models.whispermodel import WhisperTranscriber

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Whisper Transcriber")
        self.setGeometry(100, 100, 400, 200)

        self.transcriber = WhisperTranscriber()

        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        self.label = QLabel("Select an audio file:")
        layout.addWidget(self.label)

        self.file_input = QLineEdit(self)
        layout.addWidget(self.file_input)

        self.browse_button = QPushButton("Browse", self)
        self.browse_button.clicked.connect(self.browse_file)
        layout.addWidget(self.browse_button)

        self.transcribe_button = QPushButton("Transcribe", self)
        self.transcribe_button.clicked.connect(self.transcribe_audio)
        layout.addWidget(self.transcribe_button)

        self.result_label = QLabel("")
        layout.addWidget(self.result_label)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

    def browse_file(self):
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getOpenFileName(self, "Select Audio File", "", "Audio Files (*.wav *.mp3 *.m4a)", options=options)
        if file_name:
            self.file_input.setText(file_name)

    def transcribe_audio(self):
        file_path = self.file_input.text()
        if file_path:
            transcription = self.transcriber.transcribe_audio(file_path)
            if transcription:
                self.result_label.setText("Transcription successful!")
            else:
                self.result_label.setText("Transcription failed.")
        else:
            self.result_label.setText("Please select an audio file.")

if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())