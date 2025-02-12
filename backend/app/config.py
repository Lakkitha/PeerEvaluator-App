import os
from firebase_admin import credentials, initialize_app, firestore, auth

# Firebase configuration
firebase_config = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
}

cred = credentials.Certificate(firebase_config)
firebase_app = initialize_app(cred)

# Firestore database
db = firestore.client()