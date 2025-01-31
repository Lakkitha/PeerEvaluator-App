import whisper
import torch
import os
import gc
import time
from datetime import datetime
import torch.multiprocessing as mp
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def optimize_cuda_settings():
    if torch.cuda.is_available():
        # Optimize CUDA settings
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
        torch.backends.cudnn.enabled = True
        torch.backends.cudnn.deterministic = False
        
        # Set memory allocation
        torch.cuda.empty_cache()
        torch.cuda.memory_allocated()
        return True
    return False

# Cache for loaded models
model_cache = {}

def load_or_get_model(model_size, device):
    cache_key = f"{model_size}_{device}"
    if cache_key not in model_cache:
        model_cache[cache_key] = whisper.load_model(model_size, device=device)
    return model_cache[cache_key]

def save_transcription(text, audio_filename):
    try:
        # Create transcription directory
        transcript_dir = os.path.join(os.path.dirname(__file__), "transcription")
        os.makedirs(transcript_dir, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(os.path.basename(audio_filename))[0]
        output_file = os.path.join(transcript_dir, f"{base_name}_{timestamp}.txt")
        
        # Save transcription
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)
        
        return output_file
    except Exception as e:
        logger.error(f"Error saving transcription: {e}")
        return None

def transcribe_audio(model_size="tiny", file_path=None):
    start_time = time.time()
    try:
        # Optimize CUDA
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")
        optimize_cuda_settings()
        
        # Load or get cached model
        model = load_or_get_model(model_size, device)
        
        options = {
            "language": "en",
            "task": "transcribe",
            "fp16": True if device == "cuda" else False,
            "beam_size": 5,
            "best_of": 5
        }
        
        # Use provided path or default
        audio_path = file_path if file_path else "./testaudio/TestingVoice.wav"
        
        # Transcribe with performance logging
        with torch.inference_mode():
            result = model.transcribe(audio_path, **options)
        
        # Memory management
        if device == "cuda":
            torch.cuda.empty_cache()
            gc.collect()
        
        text = result["text"]
        elapsed_time = time.time() - start_time
        logger.info(f"Transcription completed in {elapsed_time:.2f} seconds")
        
        # Save transcription to file
        save_transcription(text, audio_path)
        
        return text
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return None

if __name__ == "__main__":
    mp.freeze_support()
    text = transcribe_audio()
    if text:
        print(f"\nTranscription: {text}")