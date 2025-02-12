from fastapi import APIRouter, HTTPException, File,Depends
from app.services.speech_services import analyze_speech
from app.config import db
from app.services.firebase_services import verify_token

router = APIRouter()

@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...), user=Depends(verify_token)):
    result = analyze_speech(file)

    # Save to Firestore
    doc_ref = db.collection("speech_results").document()
    doc_ref.set({
        "user_id": user["uid"],
        "text": result,
        "timestamp": firestore.SERVER_TIMESTAMP
    })

    return {"analysis_result": result}