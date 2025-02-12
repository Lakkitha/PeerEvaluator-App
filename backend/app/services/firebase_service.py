from firebase_admin import firestore, storage
from datetime import datetime

class FirebaseService:
    def __init__(self):
        self.db = firestore.client()
        self.bucket = storage.bucket()

    async def save_speech_analysis(self, user_id: str, analysis_data: dict):
        """Save speech analysis results to Firestore"""
        doc_ref = self.db.collection('speech_analysis').document()
        analysis_data.update({
            'user_id': user_id,
            'created_at': datetime.now(),
        })
        doc_ref.set(analysis_data)
        return doc_ref.id

    async def upload_audio(self, file_bytes: bytes, filename: str):
        """Upload audio file to Firebase Storage"""
        blob = self.bucket.blob(f'audio/{filename}')
        blob.upload_from_string(file_bytes)
        return blob.public_url