import whisper

# Load the model (example for large model)
model = whisper.load_model("small")

# Transcribe audio
result = model.transcribe("./testaudio/AIdudes.wav")
print(result["text"])