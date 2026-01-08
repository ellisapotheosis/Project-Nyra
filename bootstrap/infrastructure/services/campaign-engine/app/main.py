from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from jinja2 import Template

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "campaigns"

app = FastAPI(title="Nyra Campaign Engine", version="0.1.0")

class CampaignInfo(BaseModel):
    id: str
    name: str
    version: str
    timezone: str

class RenderRequest(BaseModel):
    campaign_id: str
    step_index: int = Field(..., ge=0)
    variables: Dict[str, Any] = Field(default_factory=dict)

class TriggerRequest(BaseModel):
    campaign_id: str
    lead_id: str
    variables: Dict[str, Any] = Field(default_factory=dict)
    # where n8n listens
    n8n_webhook_url: Optional[str] = None

def load_campaign(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def list_campaign_paths() -> List[Path]:
    return sorted(DATA_DIR.glob("*.json"))

@app.get("/health")
def health():
    return {"ok": True, "campaign_dir": str(DATA_DIR)}

@app.get("/v1/campaigns", response_model=List[CampaignInfo])
def campaigns():
    out=[]
    for p in list_campaign_paths():
        c=load_campaign(p)
        out.append(CampaignInfo(id=c["id"], name=c.get("name",""), version=c.get("version",""), timezone=c.get("timezone","UTC")))
    return out

@app.post("/v1/campaigns/render")
def render(req: RenderRequest):
    path = next((p for p in list_campaign_paths() if load_campaign(p).get("id")==req.campaign_id), None)
    if not path:
        raise HTTPException(404, "campaign not found")
    c=load_campaign(path)
    steps=c.get("steps",[])
    if req.step_index >= len(steps):
        raise HTTPException(400, "step_index out of range")
    step=steps[req.step_index]
    body=step.get("body","")
    # Jinja2 template render
    rendered = Template(body).render(**req.variables)
    return {"campaign_id": c["id"], "step_index": req.step_index, "channel": step.get("channel"), "rendered": rendered}

@app.post("/v1/campaigns/n8n_payload")
def n8n_payload(req: TriggerRequest):
    """Produce a payload n8n can execute. (You post this to an n8n webhook.)"""
    path = next((p for p in list_campaign_paths() if load_campaign(p).get("id")==req.campaign_id), None)
    if not path:
        raise HTTPException(404, "campaign not found")
    c=load_campaign(path)
    return {
        "campaign": c,
        "lead_id": req.lead_id,
        "variables": req.variables,
        "recommended_webhook": req.n8n_webhook_url or "http://n8n:5678/webhook/nyra/campaign/execute"
    }
