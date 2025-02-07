import whisper
import torch
import os
import gc
import time

class WhisperTranscriber:
    def __init__(self):
        self.model_cache = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.optimize_cuda_settings()

    def optimize_cuda_settings(self):
        if torch.cuda.is_available():
            torch.backends.cudnn.benchmark = True
            torch.backends.cuda.matmul.allow_tf32 = True
            torch.backends.cudnn.allow_tf32 = True

    def transcribe_audio(self, file_path, model_size="tiny"):
        try:
            model = self.load_or_get_model(model_size)
            result = model.transcribe(
                file_path,
                language="en",
                task="transcribe",
                fp16=self.device == "cuda"
            )
            return result["text"]
        except Exception as e:
            print(f"Transcription error: {e}")
            return None

    def load_or_get_model(self, model_size):
        cache_key = f"{model_size}_{self.device}"
        if cache_key not in self.model_cache:
            self.model_cache[cache_key] = whisper.load_model(
                model_size,
                device=self.device
            )
        return self.model_cache[cache_key]