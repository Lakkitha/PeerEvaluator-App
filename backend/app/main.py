from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import speech, users

app = FastAPI(title="PeerEvaluator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "PeerEvaluator API is running"}