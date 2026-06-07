# 🎙️ Kyutai PocketTTS OpenAI Wrapper
# Powered by official 'pocket-tts' library from Kyutai Labs.
# Repository: https://github.com/kyutai-labs/pocket-tts

import io
import os
import re
import uvicorn
import scipy.io.wavfile
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from pocket_tts import TTSModel
from pathlib import Path

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pocket-tts-wrapper")
SENSITIVE_PATTERNS = (
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE),
    re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    re.compile(r"\b\d{3}-?\d{2}-?\d{4}\b"),
    re.compile(
        r"\b(?:api[_-]?key|token|secret|authorization|password)\b\s*[:=]\s*[\"']?[^\"',\s}]+",
        re.IGNORECASE,
    ),
    re.compile(r"\bBearer\s+[A-Za-z0-9._~+/=-]+", re.IGNORECASE),
)


def redact_sensitive(value) -> str:
    text = str(value)
    for pattern in SENSITIVE_PATTERNS:
        text = pattern.sub("[REDACTED]", text)
    return text

# --- Configuration (Standardized) ---
VOICE_DIR = Path(os.getenv("VOICE_DIR", "/app/voices"))
MODEL_ID = os.getenv("POCKET_TTS_MODEL_ID", "b6369a24")
DEVICE = os.getenv("DEVICE", "cpu")

# --- Initialize Kyutai Model ---
try:
    logger.info(f"🚀 Initializing Kyutai PocketTTS ({MODEL_ID}) on {DEVICE}...")
    tts_model = TTSModel.load_model(MODEL_ID)
except Exception as e:
    logger.error(f"❌ Failed to load Kyutai model: {redact_sensitive(e)}")
    # We allow the app to start so the health endpoint can report the error, 
    # but actual TTS calls will fail.
    tts_model = None

app = FastAPI(title="Kyutai PocketTTS OpenAI Wrapper")

# Built-in voices map (Kyutai standards)
# Note: These paths are official Kyutai HuggingFace locations.
BUILTIN_VOICES = {
    "alba": "hf://kyutai/tts-voices/alba-mackenna/casual.wav",
    "marius": "hf://kyutai/tts-voices/marius-le-gall/casual.wav",
    "jean": "hf://kyutai/tts-voices/jean-marius/casual.wav",
    "cosette": "hf://kyutai/tts-voices/cosette-alba/casual.wav"
}

# Cache for voice states to avoid re-extracting audio prompts
voice_state_cache = {}

def get_voice_state(voice_name: str):
    """Calculates or retrieves the voice state (embedding) for a voice."""
    if voice_name in voice_state_cache:
        return voice_state_cache[voice_name]
    
    # 1. Check built-in Kyutai voices
    if voice_name in BUILTIN_VOICES:
        prompt_path = BUILTIN_VOICES[voice_name]
    # 2. Check local voices folder (for clones)
    else:
        local_path = VOICE_DIR / f"{voice_name}.wav"
        if local_path.exists():
            prompt_path = str(local_path)
        else:
            # Fallback to 'alba'
            logger.warning(f"⚠️ Voice '{voice_name}' not found. Falling back to official 'alba'.")
            voice_name = "alba"
            if voice_name in voice_state_cache:
                return voice_state_cache[voice_name]
            prompt_path = BUILTIN_VOICES["alba"]

    try:
        logger.info(f"🎙️ Extracting Kyutai Voice State: {voice_name}")
        state = tts_model.get_state_for_audio_prompt(prompt_path)
        voice_state_cache[voice_name] = state
        return state
    except Exception as e:
        logger.error(f"❌ Failed to extract voice state for {voice_name}: {redact_sensitive(e)}")
        raise HTTPException(status_code=500, detail="Voice extraction failed")

@app.get("/health")
async def health():
    if tts_model is None:
        return {"status": "error", "message": "Model not loaded"}
    return {"status": "ok", "engine": "pocket-tts", "vendor": "Kyutai Labs"}

@app.post("/v1/audio/speech")
async def speech(request: Request):
    """Drop-in OpenAI-compatible API."""
    if tts_model is None:
        raise HTTPException(status_code=503, detail="TTS Model not initialized")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    text = data.get("input", "")
    voice = data.get("voice", "alba").lower()
    
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'input' text")

    # Get the embedding for the requested voice
    voice_state = get_voice_state(voice)
    
    # Generate audio (synchronous)
    try:
        logger.info(f"🔊 Synthesis start (len: {len(text)})")
        audio_tensor = tts_model.generate_audio(voice_state, text)
        
        # Convert tensor to wav-formatted byte buffer
        buffer = io.BytesIO()
        # audio_tensor is a torch.Tensor, .numpy() requires numpy but we don't need to import it
        audio_np = audio_tensor.numpy()
        scipy.io.wavfile.write(buffer, tts_model.sample_rate, audio_np)
        buffer.seek(0)
        
        return StreamingResponse(buffer, media_type="audio/wav")
    except Exception as e:
        logger.error(f"❌ Synthesis failed: {redact_sensitive(e)}")
        raise HTTPException(status_code=500, detail="Synthesis failed")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
