from firebase_admin import auth
from fastapi import HTTPException, Header

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token is missing")
    try:
        token = authorization.split(" ")[1]
        return auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")