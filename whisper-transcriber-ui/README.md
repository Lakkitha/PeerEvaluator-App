# Whisper Transcriber UI

This project provides a user interface for the WhisperTranscriber class, which is responsible for transcribing audio files using the Whisper model. The application allows users to select audio files and initiate the transcription process, displaying the results in a user-friendly manner.

## Project Structure

```
whisper-transcriber-ui
├── src
│   ├── app.py               # Entry point of the application
│   ├── ui
│   │   ├── __init__.py      # UI package initializer
│   │   └── main_window.py    # Main user interface implementation
│   └── utils
│       ├── __init__.py      # Utils package initializer
│       └── file_handler.py    # Utility functions for file operations
├── Models
│   └── whispermodel.py      # Contains the WhisperTranscriber class
├── storage
│   ├── audio                # Directory for storing audio files
│   └── transcriptions       # Directory for storing transcription results
├── requirements.txt         # Project dependencies
└── README.md                # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd whisper-transcriber-ui
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Ensure that you have the necessary audio files in the `storage/audio` directory.

## Usage Guidelines

1. Run the application:
   ```
   python src/app.py
   ```

2. Use the user interface to select an audio file from the `storage/audio` directory.

3. Click the "Transcribe" button to initiate the transcription process.

4. The transcription results will be saved in the `storage/transcriptions` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.