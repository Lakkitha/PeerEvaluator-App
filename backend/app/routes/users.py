from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase_services import verify_token

router = APIRouter()

@router.get("/me")
def get_current_user(user=Depends(verify_token)):
    return {"username": user["name"], "email": user["email"]}