import numpy as np
import librosa
from typing import Dict

class LoudnessAnalyzer:
    def __init__(self):
        pass

    def analyze(self, audio: np.ndarray) -> Dict:
        """Analyze loudness features of audio"""
        rms = librosa.feature.rms(y=audio)[0]

        return {
            "mean_loudness": float(np.mean(rms)),
            "std_loudness": float(np.std(rms)),
            "max_loudness": float(np.max(rms)),
            "min_loudness": float(np.min(rms)),
            "dynamic_range": float(np.max(rms) - np.min(rms))
        }