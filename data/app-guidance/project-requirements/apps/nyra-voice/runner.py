from fastapi import FastAPI
from agents.quote_agent import handle_quote
from agents.call_agent import handle_lead_ping
from agents.tts_agent import speak_text
from api.routes import register_routes

app = FastAPI()
register_routes(app)

@app.get("/")
def root():
    return {"message": "Nyra Core Agent Stack is running."}