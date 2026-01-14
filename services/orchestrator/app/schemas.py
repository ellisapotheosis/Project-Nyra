from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class MessageType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    CALL = "call"
    VOICEMAIL = "voicemail"


class MessageClassification(str, Enum):
    ALLOWED = "allowed"
    APPROVAL_REQUIRED = "approval_required"
    BLOCKED = "blocked"


class ConsentType(str, Enum):
    EXPRESS_WRITTEN = "express_written"
    VERBAL = "verbal"
    IMPLIED = "implied"
    NONE = "none"


class WorkflowRequest(BaseModel):
    lead_id: str
    phone: str
    email: str
    name: str
    loan_amount: float
    property_value: float
    credit_score: int
    loan_type: str
    timezone: str = "America/New_York"


class QuoteRequest(BaseModel):
    loan_amount: float
    property_value: float
    credit_score: int
    loan_type: str = Field(default="conventional")
    loan_term_years: int = Field(default=30)


class ComplianceCheckRequest(BaseModel):
    lead_id: str
    message_type: MessageType
    phone: Optional[str] = None
    email: Optional[str] = None
    scheduled_time: Optional[datetime] = None


class ComplianceCheckResponse(BaseModel):
    classification: MessageClassification
    allowed: bool
    reason: Optional[str] = None
    consent_status: ConsentType
    quiet_hours_violation: bool
    opt_out_detected: bool
    audit_id: str


class WorkflowResponse(BaseModel):
    workflow_id: str
    lead_id: str
    quote_id: str
    campaign_id: str
    compliance_status: str
    created_at: datetime
    next_action: Optional[str] = None


class AuditLog(BaseModel):
    audit_id: str
    timestamp: datetime
    lead_id: str
    action: str
    classification: MessageClassification
    details: Dict[str, Any]
    compliance_passed: bool
