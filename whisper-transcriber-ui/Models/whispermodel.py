# FILE: /whisper-transcriber-ui/Models/whispermodel.py
import os
import gc
import time
import json
import torch
from faster_whisper import WhisperModel
from datetime import datetime
from pathlib import Path

class WhisperTranscriber:
    def __init__(self, model_size="tiny"):
        self.model_cache = {}
        # Check if CUDA is available
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.compute_type = "float16" if self.device == "cuda" else "float32"

        # Setup storage paths
        self.storage_path = Path(__file__).parent.parent / "storage"
        self.audio_path = self.storage_path / "audio"
        self.transcription_path = self.storage_path / "transcriptions"
        self._create_directories()

    def _create_directories(self):
        """Create necessary directories if they don't exist"""
        self.audio_path.mkdir(parents=True, exist_ok=True)
        self.transcription_path.mkdir(parents=True, exist_ok=True)

    def transcribe_audio(self, file_path, model_size="tiny", progress_callback=None, **kwargs):
        try:
            start_time = time.time()

            # Validate file exists
            if not Path(file_path).exists():
                raise FileNotFoundError(f"Audio file not found: {file_path}")

            # Load or get model from cache
            model = self.load_or_get_model(model_size)

            # Update progress if callback provided
            if progress_callback:
                progress_callback(10)  # Initial progress

            # Transcribe with faster-whisper
            segments, info = model.transcribe(
                file_path,
                language="en",
                task="transcribe",
                beam_size=5,
                best_of=5,
                **kwargs
            )

            # Update progress
            if progress_callback:
                progress_callback(50)  # Halfway through

            # Collect all segments into full transcription
            transcription = ""
            for segment in segments:
                transcription += segment.text + " "

            transcription = transcription.strip()

            # Save transcription
            self._save_transcription(transcription, file_path)

            # Final progress update
            if progress_callback:
                progress_callback(100)  # Complete

            print(f"Transcription completed in {time.time() - start_time:.2f}s")
            return transcription

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

        return output_file

    def load_or_get_model(self, model_size):
        """Load model or get from cache if already loaded"""
        cache_key = f"{model_size}_{self.device}_{self.compute_type}"

        if cache_key not in self.model_cache:
            # Configure model with appropriate settings for the device
            self.model_cache[cache_key] = WhisperModel(
                model_size,
                device=self.device,
                compute_type=self.compute_type
            )

        return self.model_cache[cache_key]

    def clear_cache(self):
        """Clear model cache and GPU memory"""
        self.model_cache.clear()
        if self.device == "cuda":
            torch.cuda.empty_cache()
            gc.collect()

    def get_available_models(self):
        """Returns list of available model sizes"""
        return ["tiny", "base", "small", "medium", "large", "large-v2"]

    def estimate_transcription_time(self, audio_duration, model_size):
        """Estimate transcription time based on audio duration and model size"""
        # These are rough estimates and will vary by hardware
        speed_factors = {
            "tiny": 0.1,
            "base": 0.15,
            "small": 0.25,
            "medium": 0.5,
            "large": 1.0,
            "large-v2": 1.2
        }

        # Base speed (CPU processing)
        base_speed = 0.5  # Processing takes about half the audio duration on CPU

        # Adjust for model size and device
        speed_factor = speed_factors.get(model_size, 0.5)
        device_factor = 0.2 if self.device == "cuda" else 1.0  # GPU is roughly 5x faster

        # Calculate estimated time in seconds
        estimated_time = audio_duration * base_speed * speed_factor * device_factor

        return max(1.0, estimated_time)  # At least 1 second