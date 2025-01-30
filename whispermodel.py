import whisper
import torch
import os
import gc
from datetime import datetime
import torch.multiprocessing as mp

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
        print(f"Error saving transcription: {e}")
        return None

def monitor_gpu():
    try:
        if torch.cuda.is_available():
            for i in range(torch.cuda.device_count()):
                allocated = torch.cuda.memory_allocated(i)/1e9
                cached = torch.cuda.memory_reserved(i)/1e9
                print(f"GPU {i} - Allocated: {allocated:.2f}GB, Cached: {cached:.2f}GB")
    except Exception as e:
        print(f"Monitoring error: {e}")

def optimize_cuda_settings():
    if torch.cuda.is_available():
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
        torch.backends.cudnn.enabled = True
        return True
    return False

def transcribe_audio(model_size="tiny"):
    try:
        monitor_gpu()
        optimize_cuda_settings()
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        
        model = whisper.load_model(model_size, device=device)
        
        options = {
            "language": "en",
            "task": "transcribe",
            "fp16": True if device == "cuda" else False
        }
        
        audio_path = "./testaudio/TestingVoice.wav"
        result = model.transcribe(audio_path, **options)
        
        if device == "cuda":
            torch.cuda.empty_cache()
            gc.collect()
        
        # Save transcription to file
        text = result["text"]
        saved_path = save_transcription(text, audio_path)
        
        if saved_path:
            print(f"\nTranscription saved to: {saved_path}")
        
        return text
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    mp.freeze_support()
    text = transcribe_audio()
    if text:
        print(f"\nTranscription: {text}")