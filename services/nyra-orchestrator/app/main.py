from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nyra Orchestrator", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class LeadRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    loan_amount: float
    property_value: float
    credit_score: int

class LeadResponse(BaseModel):
    lead_id: str
    status: str
    compliance_passed: bool
    quote_generated: bool
    crm_synced: bool
    created_at: datetime

class ComplianceCheck(BaseModel):
    lead_id: str
    passed: bool
    checks: dict

@app.post("/leads", response_model=LeadResponse)
async def process_lead(lead: LeadRequest):
    lead_id = f"LEAD{datetime.now().strftime('%Y%m%d%H%M%S')}"
    logger.info(f"Processing lead {lead_id} for {lead.email}")
    compliance_passed = lead.credit_score >= 580
    return LeadResponse(
        lead_id=lead_id,
        status="processed",
        compliance_passed=compliance_passed,
        quote_generated=True,
        crm_synced=True,
        created_at=datetime.now()
    )

@app.post("/compliance/check", response_model=ComplianceCheck)
async def check_compliance(lead_id: str, data: dict):
    passed = True
    checks = {
        "identity_verified": True,
        "credit_check": True,
        "income_verified": True,
        "regulatory_compliance": True
    }
    return ComplianceCheck(lead_id=lead_id, passed=passed, checks=checks)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nyra-orchestrator"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
