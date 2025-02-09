import librosa
import numpy as np
import json
import logging
from pathlib import Path
from typing import Dict, Tuple, Optional
from datetime import datetime
from .analysis.pitch_analyzer import PitchAnalyzer
from .analysis.loudness_analyzer import LoudnessAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self, sample_rate: int = 22050):
        self.sample_rate = sample_rate
        self.pitch_analyzer = PitchAnalyzer()
        self.loudness_analyzer = LoudnessAnalyzer()

    def load_audio(self, file_path: str) -> Tuple[Optional[np.ndarray], int]:
        """Load and preprocess audio file"""
        try:
            if not Path(file_path).exists():
                raise FileNotFoundError(f"Audio file not found: {file_path}")

            audio, sr = librosa.load(file_path, sr=self.sample_rate)
            if sr != self.sample_rate:
                logger.warning(f"Sample rate mismatch. Expected {self.sample_rate}, got {sr}")
            return audio, sr
        except Exception as e:
            logger.error(f"Error loading audio: {e}")
            return None, self.sample_rate

    def analyze_audio(self, file_path: str) -> Dict:
        """Complete audio analysis pipeline"""
        try:
            audio, sr = self.load_audio(file_path)
            if audio is None:
                return {"error": "Failed to load audio file"}

            # Get audio quality information
            quality_info = self.check_audio_quality(file_path)
            if not quality_info["is_valid"]:
                return {"error": "Invalid audio file"}

            # Perform analysis using specialized analyzers
            analysis = {
                "file_info": quality_info,
                "pitch_analysis": self.pitch_analyzer.analyze(audio, sr),
                "loudness_analysis": self.loudness_analyzer.analyze(audio)
            }

            # Add timestamp to analysis
            analysis["timestamp"] = datetime.now().isoformat()

            # Save analysis results
            self._save_analysis(analysis, file_path)
            return analysis

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {"error": str(e)}

    def _save_analysis(self, analysis: Dict, audio_path: str) -> None:
        """Save analysis results to JSON file"""
        try:
            analysis_dir = Path(audio_path).parent.parent / "analysis"
            analysis_dir.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = analysis_dir / f"analysis_{timestamp}.json"

            with open(output_file, 'w') as f:
                json.dump(analysis, f, indent=4)
            logger.info(f"Analysis saved to {output_file}")

        except Exception as e:
            logger.error(f"Failed to save analysis: {e}")

    def check_audio_quality(self, file_path: str) -> Dict:
        """Check audio file quality and format"""
        try:
            audio, sr = librosa.load(file_path)
            duration = librosa.get_duration(y=audio, sr=sr)

            quality_info = {
                "duration": float(duration),
                "sample_rate": int(sr),
                "channels": 1 if len(audio.shape) == 1 else 2,
                "file_size": Path(file_path).stat().st_size,
                "is_valid": True
            }

            # Add quality checks
            quality_info["duration_ok"] = 0 < duration < 600  # Max 10 minutes
            quality_info["sample_rate_ok"] = sr >= 16000  # Minimum quality

            return quality_info

        except Exception as e:
            logger.error(f"Audio quality check failed: {e}")
            return {"is_valid": False, "error": str(e)}