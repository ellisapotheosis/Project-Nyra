from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Dict, Optional, Literal, Any

Decision = Literal["allow","needs_human","block"]

class ClassifyRequest(BaseModel):
    text: str
    channel: Literal["sms","email","webchat"] = "webchat"
    lead_id: Optional[str] = None

class ClassifyResponse(BaseModel):
    decision: Decision
    reason: str
    safe_reply: Optional[str] = None

class DispatchRequest(BaseModel):
    decision_override: Optional[Decision] = None
    lead_id: str
    channel: Literal["sms","email"]
    to: str
    template_id: str = Field(..., description="Vetted template identifier")
    variables: Dict[str, Any] = Field(default_factory=dict)

class DispatchResponse(BaseModel):
    ok: bool
    forwarded_to: str
