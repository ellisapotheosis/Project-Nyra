from __future__ import annotations

import os
import httpx
from fastapi import FastAPI, HTTPException
from jinja2 import Template

from .schemas import ClassifyRequest, ClassifyResponse, DispatchRequest, DispatchResponse
from .policy import classify_message
from .templates import SAFE_TEMPLATES

app = FastAPI(title="Nyra Orchestrator", version="0.1.0")

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook/nyra/dispatch")

@app.get("/health")
def health():
    return {"ok": True, "n8n_webhook": N8N_WEBHOOK_URL}

@app.post("/v1/classify_message", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    decision, reason = classify_message(req.text)
    safe_reply = None
    if decision == "needs_human":
        safe_reply = SAFE_TEMPLATES["handoff_human"]
    if decision == "block":
        safe_reply = "I can’t collect that here. Please use the secure upload link we provide."
    return ClassifyResponse(decision=decision, reason=reason, safe_reply=safe_reply)

@app.post("/v1/action/dispatch", response_model=DispatchResponse)
async def dispatch(req: DispatchRequest) -> DispatchResponse:
    if req.template_id not in SAFE_TEMPLATES:
        raise HTTPException(400, "Unknown template_id (must be vetted)")
    body = Template(SAFE_TEMPLATES[req.template_id]).render(**req.variables)

    payload = {
        "lead_id": req.lead_id,
        "channel": req.channel,
        "to": req.to,
        "body": body,
        "template_id": req.template_id,
        "variables": req.variables,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(N8N_WEBHOOK_URL, json=payload)
        if r.status_code >= 300:
            raise HTTPException(502, f"n8n webhook failed: {r.status_code} {r.text}")

    return DispatchResponse(ok=True, forwarded_to=N8N_WEBHOOK_URL)
