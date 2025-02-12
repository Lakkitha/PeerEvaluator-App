import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

# Firebase configuration
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

# Firestore database
db = firestore.client()