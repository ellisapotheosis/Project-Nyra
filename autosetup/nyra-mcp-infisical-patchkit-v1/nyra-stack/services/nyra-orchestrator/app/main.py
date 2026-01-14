from __future__ import annotations

import os
import re
from typing import Literal, Optional, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel, Field

POLICY_MODE = os.getenv("NYRA_POLICY_MODE", "strict").lower()
ALLOWED_CHANNELS = {c.strip() for c in os.getenv("NYRA_ALLOWED_CHANNELS", "sms,email,webchat").split(",") if c.strip()}
ESCALATION_EMAIL = os.getenv("NYRA_ESCALATION_EMAIL", "ops@example.com")

app = FastAPI(title="Nyra Orchestrator", version="0.1.0")

# ---- Guardrail vocabulary
BANNED_TOPICS = [
    r"\brate\b", r"\bapr\b", r"\bpoints?\b", r"\bfees?\b",
    r"\binterest\b", r"\bpayment\b", r"\bquote\b", r"\block\b",
    r"\bapproval\b", r"\bdenied\b", r"\bunderwrite\b", r"\bcredit\b",
    r"\bpricing\b", r"\brespa\b", r"\btila\b", r"\btrid\b",
]
BANNED_RE = re.compile("|".join(BANNED_TOPICS), re.IGNORECASE)

ALLOWED_INTENTS = {
    "status_update",
    "document_request",
    "appointment_scheduling",
    "message_relay",
    "identity_verification",
}

class LogisticsRequest(BaseModel):
    channel: Literal["sms","email","webchat"] = "webchat"
    user_id: str = Field(..., description="Stable user identifier (phone/email/CRM person id).")
    message: str

class LogisticsResponse(BaseModel):
    allowed: bool
    intent: Optional[str] = None
    response: str
    escalation: Optional[Dict[str, Any]] = None

@app.get("/health")
def health():
    return {"ok": True, "policy_mode": POLICY_MODE, "allowed_channels": sorted(ALLOWED_CHANNELS)}

def classify_intent(msg: str) -> str:
    m = msg.lower()
    if any(k in m for k in ["upload", "document", "paystub", "w2", "tax", "bank statement", "id", "driver", "passport"]):
        return "document_request"
    if any(k in m for k in ["appointment", "schedule", "time", "calendar", "meet", "call me", "call back"]):
        return "appointment_scheduling"
    if any(k in m for k in ["status", "where", "update", "processing", "underwriting", "closing", "funding"]):
        return "status_update"
    if any(k in m for k in ["tell", "message", "let them know", "relay"]):
        return "message_relay"
    return "status_update"

def logistics_guardrail(msg: str) -> Optional[str]:
    if BANNED_RE.search(msg):
        return ("I can’t discuss loan terms, rates, pricing, or underwriting decisions in this channel. "
                "I *can* help with logistics: document collection, scheduling, and status updates. "
                f"If you need to talk terms, I’ll forward this to a licensed loan officer. (Escalation: {ESCALATION_EMAIL})")
    return None

@app.post("/chat/logistics", response_model=LogisticsResponse)
def chat_logistics(req: LogisticsRequest):
    if req.channel not in ALLOWED_CHANNELS:
        return LogisticsResponse(
            allowed=False,
            response=f"Channel '{req.channel}' not enabled.",
        )

    blocked = logistics_guardrail(req.message)
    if blocked:
        return LogisticsResponse(
            allowed=False,
            intent=None,
            response=blocked,
            escalation={"to": ESCALATION_EMAIL, "reason": "loan_terms_detected"},
        )

    intent = classify_intent(req.message)
    if intent not in ALLOWED_INTENTS:
        intent = "status_update"

    # Minimal “safe” responses (you will replace with CRM-driven logic)
    if intent == "document_request":
        resp = ("Got it. Please upload the requested documents using your secure upload link. "
                "If you don’t have the link, reply with the best email address and we’ll send it.")
    elif intent == "appointment_scheduling":
        resp = ("Sure — what day/time works best, and what timezone are you in? "
                "If you prefer, I can send a calendar link.")
    elif intent == "message_relay":
        resp = ("Understood. I’ll relay your message to the team and confirm once it’s delivered.")
    else:
        resp = ("Thanks — I can provide status updates and next steps. "
                "What is the best identifier to locate your file (full name + last 4 of phone), or your application ID?")

    return LogisticsResponse(allowed=True, intent=intent, response=resp)

# A webhook stub for future Twenty events
class TwentyWebhook(BaseModel):
    event: str
    payload: Dict[str, Any]

@app.post("/webhook/twenty")
def twenty_webhook(hook: TwentyWebhook):
    # In production you would:
    # 1) verify signature
    # 2) upsert CRM data to graph + memory
    # 3) enqueue outbound comms
    return {"ok": True, "received_event": hook.event}
