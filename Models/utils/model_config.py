from pathlib import Path
import json

class ModelConfig:
    def __init__(self):
        self.config_path = Path(__file__).parent.parent.parent / "config/model_settings.json"
        self.load_config()

    def load_config(self):
        """Load model configuration"""
        if self.config_path.exists():
            with open(self.config_path, 'r') as f:
                self.settings = json.load(f)
        else:
            self.settings = self.default_settings()
            self.save_config()

    def default_settings(self):
        """Default model settings"""
        return {
            "model_settings": {
                "tiny": {
                    "beam_size": 5,
                    "best_of": 5,
                    "fp16": True
                },
                "base": {
                    "beam_size": 5,
                    "best_of": 5,
                    "fp16": True
                }
            },
            "audio_settings": {
                "sample_rate": 16000,
                "max_duration": 600,  # 10 minutes
                "min_duration": 1     # 1 second
            }
        }

    def save_config(self):
        """Save current configuration"""
        with open(self.config_path, 'w') as f:
            json.dump(self.settings, f, indent=4)