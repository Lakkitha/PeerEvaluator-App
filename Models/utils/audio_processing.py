import librosa
import numpy as np
from pathlib import Path

class AudioProcessor:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate

    def load_audio(self, file_path):
        """Load and preprocess audio file"""
        try:
            audio, _ = librosa.load(file_path, sr=self.sample_rate)
            return audio
        except Exception as e:
            print(f"Error loading audio: {e}")
            return None

    def check_audio_quality(self, file_path):
        """Check audio file quality and format"""
        try:
            audio, sr = librosa.load(file_path)
            duration = librosa.get_duration(y=audio, sr=sr)

            return {
                "duration": duration,
                "sample_rate": sr,
                "channels": 1 if len(audio.shape) == 1 else 2,
                "is_valid": True
            }
        except Exception as e:
            return {"is_valid": False, "error": str(e)}