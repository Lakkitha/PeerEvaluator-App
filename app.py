import os
import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext
from pathlib import Path
import pyaudio
import wave
import threading
import time
import datetime
from Models.whispermodel import WhisperTranscriber

class WhisperTranscriberApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Whisper Audio Transcriber")
        self.root.geometry("800x600")
        self.root.resizable(True, True)

        self.transcriber = WhisperTranscriber()
        self.model_size = tk.StringVar(value="tiny")

        # Recording variables
        self.is_recording = False
        self.audio_thread = None
        self.audio = pyaudio.PyAudio()
        self.frames = []
        self.temp_file = None

        # Setup recordings directory
        self.recordings_dir = Path("whisper-transcriber-ui/recordings")
        self.recordings_dir.mkdir(parents=True, exist_ok=True)

        self.create_widgets()

    def create_widgets(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Model selection frame
        model_frame = ttk.LabelFrame(main_frame, text="Model Settings", padding="10")
        model_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Label(model_frame, text="Model Size:").pack(side=tk.LEFT, padx=5)
        model_combo = ttk.Combobox(model_frame, textvariable=self.model_size,
                                   values=["tiny", "base", "small", "medium", "large"])
        model_combo.pack(side=tk.LEFT, padx=5)

        # File selection frame
        file_frame = ttk.LabelFrame(main_frame, text="Audio File", padding="10")
        file_frame.pack(fill=tk.X, padx=5, pady=5)

        self.file_path = tk.StringVar()
        file_entry = ttk.Entry(file_frame, textvariable=self.file_path, width=60)
        file_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)

        browse_btn = ttk.Button(file_frame, text="Browse", command=self.browse_file)
        browse_btn.pack(side=tk.LEFT, padx=5)

        # Recording frame
        record_frame = ttk.LabelFrame(main_frame, text="Record Audio", padding="10")
        record_frame.pack(fill=tk.X, padx=5, pady=5)

        self.record_btn = ttk.Button(record_frame, text="Start Recording", command=self.toggle_recording)
        self.record_btn.pack(side=tk.LEFT, padx=5)

        self.record_status = ttk.Label(record_frame, text="Not recording")
        self.record_status.pack(side=tk.LEFT, padx=10)

        # Action buttons
        btn_frame = ttk.Frame(main_frame, padding="10")
        btn_frame.pack(fill=tk.X)

        transcribe_btn = ttk.Button(btn_frame, text="Transcribe Audio", command=self.transcribe_audio)
        transcribe_btn.pack(side=tk.LEFT, padx=5)

        clear_btn = ttk.Button(btn_frame, text="Clear", command=self.clear_text)
        clear_btn.pack(side=tk.LEFT, padx=5)

        # Output text area
        output_frame = ttk.LabelFrame(main_frame, text="Transcription Output", padding="10")
        output_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, height=15)
        self.output_text.pack(fill=tk.BOTH, expand=True)

        # Status bar
        self.status_var = tk.StringVar()
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)

        self.status_var.set("Ready")

    def toggle_recording(self):
        if self.is_recording:
            self.stop_recording()
        else:
            self.start_recording()

    def start_recording(self):
        try:
            # Clear previous recording
            self.frames = []
            self.is_recording = True
            self.record_btn.config(text="Stop Recording")
            self.record_status.config(text="Recording...")

            # Generate recording file path
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            record_filename = f"recording_{timestamp}.wav"
            self.recording_path = self.recordings_dir / record_filename

            # Start recording thread
            self.audio_thread = threading.Thread(target=self.record_audio)
            self.audio_thread.daemon = True
            self.audio_thread.start()

            self.status_var.set("Recording started...")
        except Exception as e:
            self.status_var.set(f"Error starting recording: {str(e)}")
            self.is_recording = False
            self.record_btn.config(text="Start Recording")

    def record_audio(self):
        try:
            CHUNK = 1024
            FORMAT = pyaudio.paInt16
            CHANNELS = 1
            RATE = 16000  # Whisper works well with 16kHz

            # Open stream with error handling
            stream = self.audio.open(format=FORMAT,
                                    channels=CHANNELS,
                                    rate=RATE,
                                    input=True,
                                    frames_per_buffer=CHUNK)

            self.root.after(0, lambda: self.status_var.set("Recording in progress..."))

            # Record audio
            while self.is_recording:
                try:
                    data = stream.read(CHUNK, exception_on_overflow=False)
                    self.frames.append(data)
                except Exception as e:
                    print(f"Error reading audio: {e}")
                    break

            # Close stream properly
            try:
                stream.stop_stream()
                stream.close()
            except Exception as e:
                print(f"Error closing stream: {e}")

            # Save the recording
            self.save_recording()

        except Exception as e:
            print(f"Error in recording thread: {e}")
            self.root.after(0, lambda: self.status_var.set(f"Recording error: {str(e)}"))

    def save_recording(self):
        """Save the recorded audio to file"""
        try:
            if not self.frames:
                self.root.after(0, lambda: self.status_var.set("No audio recorded"))
                return

            wf = wave.open(str(self.recording_path), 'wb')
            wf.setnchannels(1)
            wf.setsampwidth(self.audio.get_sample_size(pyaudio.paInt16))
            wf.setframerate(16000)
            wf.writeframes(b''.join(self.frames))
            wf.close()

            # Update file path in UI
            self.file_path.set(str(self.recording_path))
            self.root.after(0, lambda: self.status_var.set(f"Recording saved to: {self.recording_path}"))
        except Exception as e:
            self.root.after(0, lambda: self.status_var.set(f"Error saving recording: {str(e)}"))

    def stop_recording(self):
        if not self.is_recording:
            return

        self.is_recording = False
        self.record_btn.config(text="Start Recording")
        self.record_status.config(text="Finalizing recording...")

        # Give the recording thread time to complete
        if self.audio_thread and self.audio_thread.is_alive():
            try:
                self.audio_thread.join(timeout=2.0)  # Wait for thread with timeout
            except Exception as e:
                print(f"Error joining thread: {e}")

        self.record_status.config(text="Recording finished")

    def browse_file(self):
        file_path = filedialog.askopenfilename(
            title="Select Audio File",
            filetypes=(("Audio files", "*.mp3 *.wav *.m4a *.flac"), ("All files", "*.*"))
        )
        if file_path:
            self.file_path.set(file_path)

    def transcribe_audio(self):
        file_path = self.file_path.get()
        if not file_path or not os.path.exists(file_path):
            self.status_var.set("Error: Please select a valid audio file or record audio first")
            return

        self.status_var.set("Transcribing... This may take a while depending on the model size and audio length.")
        self.output_text.delete(1.0, tk.END)
        self.root.update()

        try:
            model_size = self.model_size.get()
            transcription = self.transcriber.transcribe_audio(file_path, model_size)

            if transcription:
                self.output_text.insert(tk.END, transcription)
                self.status_var.set("Transcription completed successfully")
            else:
                self.status_var.set("Transcription failed")
        except Exception as e:
            self.status_var.set(f"Error: {str(e)}")

    def clear_text(self):
        self.output_text.delete(1.0, tk.END)
        self.status_var.set("Ready")

    def on_closing(self):
        # Clean up resources
        if self.is_recording:
            self.stop_recording()

        try:
            self.audio.terminate()
        except Exception as e:
            print(f"Error terminating audio: {e}")

        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = WhisperTranscriberApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()