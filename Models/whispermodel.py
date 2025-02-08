import whisper
import torch
import os
import gc
import time
import json
from datetime import datetime
from pathlib import Path

class WhisperTranscriber:
    def __init__(self, model_size="tiny"):
        self.model_cache = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.storage_path = Path(__file__).parent.parent / "storage"
        self.audio_path = self.storage_path / "audio"
        self.transcription_path = self.storage_path / "transcriptions"
        self._create_directories()
        self.optimize_cuda_settings()

    def _create_directories(self):
        """Create necessary directories if they don't exist"""
        self.audio_path.mkdir(parents=True, exist_ok=True)
        self.transcription_path.mkdir(parents=True, exist_ok=True)

    def optimize_cuda_settings(self):
        if torch.cuda.is_available():
            torch.backends.cudnn.benchmark = True
            torch.backends.cuda.matmul.allow_tf32 = True
            torch.backends.cudnn.allow_tf32 = True
            torch.backends.cudnn.enabled = True

    def transcribe_audio(self, file_path, model_size="tiny"):
        try:
            start_time = time.time()

            # Validate file exists
            if not Path(file_path).exists():
                raise FileNotFoundError(f"Audio file not found: {file_path}")

            model = self.load_or_get_model(model_size)

            # Transcribe with optimized settings
            result = model.transcribe(
                file_path,
                language="en",
                task="transcribe",
                fp16=self.device == "cuda",
                beam_size=5,
                best_of=5
            )

            # Save transcription
            self._save_transcription(result["text"], file_path)

            print(f"Transcription completed in {time.time() - start_time:.2f}s")
            return result["text"]

        except Exception as e:
            print(f"Transcription error: {e}")
            return None
        finally:
            if self.device == "cuda":
                torch.cuda.empty_cache()
                gc.collect()

    def _save_transcription(self, text, audio_file):
        """Save transcription with timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_name = Path(audio_file).stem
        output_file = self.transcription_path / f"{audio_name}_{timestamp}.txt"

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)

    def load_or_get_model(self, model_size):
        cache_key = f"{model_size}_{self.device}"
        if cache_key not in self.model_cache:
            self.model_cache[cache_key] = whisper.load_model(
                model_size,
                device=self.device
            )
        return self.model_cache[cache_key]

    def clear_cache(self):
        """Clear model cache and GPU memory"""
        self.model_cache.clear()
        if self.device == "cuda":
            torch.cuda.empty_cache()
            gc.collect()