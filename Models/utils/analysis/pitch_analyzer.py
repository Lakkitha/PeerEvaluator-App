import numpy as np
import librosa
from typing import Dict

class PitchAnalyzer:
    def __init__(self):
        pass

    def analyze(self, audio: np.ndarray, sr: int) -> Dict:
        """Analyze pitch features of audio"""
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch_values = np.max(pitches, axis=0)
        pitch_values = pitch_values[pitch_values > 0]

        return {
            "mean_pitch": float(np.mean(pitch_values)) if len(pitch_values) > 0 else 0.0,
            "std_pitch": float(np.std(pitch_values)) if len(pitch_values) > 0 else 0.0,
            "max_pitch": float(np.max(pitch_values)) if len(pitch_values) > 0 else 0.0,
            "min_pitch": float(np.min(pitch_values)) if len(pitch_values) > 0 else 0.0,
            "pitch_range": float(np.max(pitch_values) - np.min(pitch_values)) if len(pitch_values) > 0 else 0.0
        }