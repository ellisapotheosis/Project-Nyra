
# Nyra Voicemod TTS Handler (Stub Version)

import os
from elevenlabs import generate, play, set_api_key
from dotenv import load_dotenv

load_dotenv()
set_api_key(os.getenv("ELEVENLABS_API_KEY"))

def speak_text(text, voice="Rachel"):
    audio = generate(text=text, voice=voice)
    play(audio)
