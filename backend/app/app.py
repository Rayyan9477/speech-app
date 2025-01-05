# backend/app/app.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .models.speech_to_text import transcribe_audio
from .models.text_to_speech import generate_speech
from .models.translator import translate_text
from .utils.file_handler import save_uploaded_file, allowed_file, cleanup_old_files
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    text: str
    target_language: str

class SynthesisRequest(BaseModel):
    text: str
    language: str

@app.on_event("startup")
async def startup_event():
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("audio_outputs", exist_ok=True)

@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if not allowed_file(file.filename, {'wav', 'mp3', 'ogg'}):
        raise HTTPException(status_code=400, detail="Invalid file type")
    filename = save_uploaded_file(file, "uploads")
    file_path = os.path.join("uploads", filename)
    try:
        transcription = transcribe_audio(file_path)
        os.remove(file_path)  # Clean up the uploaded file
        return {"transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/synthesize")
async def synthesize(request: SynthesisRequest):
    try:
        audio_path = generate_speech(request.text, request.language)
        return {"audio_url": f"/audio/{os.path.basename(audio_path)}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate(request: TranslationRequest):
    try:
        translated_text = translate_text(request.text, request.target_language)
        return {"translated_text": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}