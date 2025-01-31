import tkinter as tk
from tkinter import ttk, scrolledtext
import sounddevice as sd
import soundfile as sf
import numpy as np
import os
import sys
from datetime import datetime

# Change import line to only import transcribe_audio
from Models.whispermodel import transcribe_audio

class WhisperUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Voice Transcriber")
        self.recording = False
        self.audio_data = []
        self.sample_rate = 44100
        self.setup_ui()
    
    def setup_ui(self):
        # Main frame with controls
        self.main_frame = ttk.Frame(self.root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Record button
        self.record_btn = ttk.Button(
            self.main_frame, 
            text="🎤 Start Recording",
            command=self.toggle_recording
        )
        self.record_btn.grid(row=0, column=0, pady=5)
        
        # Status label
        self.status = ttk.Label(self.main_frame, text="Ready")
        self.status.grid(row=1, column=0, pady=5)
        
        # Transcription area
        self.text_area = scrolledtext.ScrolledText(
            self.main_frame,
            width=50,
            height=10,
            wrap=tk.WORD
        )
        self.text_area.grid(row=2, column=0, pady=5)
    
    def toggle_recording(self):
        if not self.recording:
            self.start_recording()
        else:
            self.stop_recording()
    
    def start_recording(self):
        self.recording = True
        self.audio_data = []
        self.record_btn.config(text="⏹ Stop Recording")
        self.status.config(text="Recording...")
        
        def callback(indata, frames, time, status):
            if self.recording:
                self.audio_data.append(indata.copy())
        
        self.stream = sd.InputStream(
            callback=callback,
            channels=1,
            samplerate=self.sample_rate
        )
        self.stream.start()
    
    def stop_recording(self):
        if not self.audio_data:
            self.status.config(text="No audio recorded")
            return

        self.recording = False
        self.stream.stop()
        self.stream.close()
        self.record_btn.config(text="🎤 Start Recording")
        self.status.config(text="Processing...")
        
        try:
            # Save current recording
            audio_data = np.concatenate(self.audio_data, axis=0)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            current_recording = os.path.join("testaudio", f"recording_{timestamp}.wav")
            os.makedirs("testaudio", exist_ok=True)
            sf.write(current_recording, audio_data, self.sample_rate)
            
            # Directly transcribe current recording
            self.status.config(text="Transcribing...")
            text = transcribe_audio(model_size="tiny", file_path=current_recording)
            
            if text:
                self.text_area.delete(1.0, tk.END)
                self.text_area.insert(tk.END, text)
                self.status.config(text="Transcription complete")
            else:
                self.status.config(text="Transcription failed")
                
        except Exception as e:
            self.status.config(text=f"Error: {str(e)}")
            print(f"Error during recording/transcription: {e}")

def main():
    root = tk.Tk()
    app = WhisperUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()