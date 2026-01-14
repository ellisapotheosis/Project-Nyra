import uuid
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

from .schemas import (
    WorkflowRequest,
    WorkflowResponse,
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    AuditLog,
    MessageType,
    ConsentType,
)
from .compliance import (
    ConsentLedger,
    check_compliance,
    validate_regulatory_compliance
)

app = FastAPI(
    title="Nyra Orchestrator",
    description="Compliance-aware workflow orchestration for mortgage lead generation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global consent ledger (in-memory, should be database-backed in production)
consent_ledger = ConsentLedger()

# Audit logs (in-memory, should be database-backed in production)
audit_logs: list[AuditLog] = []

# Service URLs (configured for docker-compose deployment)
QUOTE_ENGINE_URL = "http://quote-engine:8001"
CAMPAIGN_ENGINE_URL = "http://campaign-engine:8002"
TWENTYCRM_URL = "http://twentycrm:3000"
N8N_URL = "http://n8n:5678"


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "orchestrator",
        "timestamp": datetime.utcnow().isoformat(),
        "consent_records": len(consent_ledger.consents),
        "opt_outs": len(consent_ledger.opt_outs),
        "audit_logs": len(audit_logs)
    }


@app.post("/workflow/create", response_model=WorkflowResponse)
async def create_workflow(request: WorkflowRequest):
    """
    Create a complete workflow for a new lead:
    1. Generate mortgage quote
    2. Check compliance
    3. Create campaign if compliant
    4. Log all actions
    """
    workflow_id = str(uuid.uuid4())

    try:
        # Step 1: Generate quote from Quote Engine
        async with httpx.AsyncClient() as client:
            quote_response = await client.post(
                f"{QUOTE_ENGINE_URL}/quote",
                json={
                    "loan_amount": request.loan_amount,
                    "property_value": request.property_value,
                    "credit_score": request.credit_score,
                    "loan_type": request.loan_type,
                    "loan_term_years": 30
                },
                timeout=10.0
            )
            quote_response.raise_for_status()
            quote_data = quote_response.json()

        # Step 2: Validate regulatory compliance
        regulatory_violations = validate_regulatory_compliance(quote_data)
        if regulatory_violations:
            raise HTTPException(
                status_code=400,
                detail=f"Regulatory compliance violations: {', '.join(regulatory_violations)}"
            )

        # Step 3: Check TCPA compliance for initial contact
        compliance_check = check_compliance(
            ComplianceCheckRequest(
                lead_id=request.lead_id,
                message_type=MessageType.SMS,
                phone=request.phone,
                scheduled_time=datetime.utcnow()
            ),
            consent_ledger
        )

        # Log audit trail
        audit_log = AuditLog(
            audit_id=compliance_check.audit_id,
            timestamp=datetime.utcnow(),
            lead_id=request.lead_id,
            action="workflow_created",
            classification=compliance_check.classification,
            details={
                "quote_id": quote_data.get("quote_id"),
                "workflow_id": workflow_id,
                "compliance_status": compliance_check.classification.value,
                "reason": compliance_check.reason
            },
            compliance_passed=compliance_check.allowed
        )
        audit_logs.append(audit_log)

        # Step 4: Create campaign if compliance allows
        campaign_id = None
        next_action = None

        if compliance_check.allowed:
            async with httpx.AsyncClient() as client:
                campaign_response = await client.post(
                    f"{CAMPAIGN_ENGINE_URL}/campaigns",
                    json={
                        "name": f"Mortgage Quote Follow-up - {request.name}",
                        "type": "mixed",
                        "status": "active",
                        "leads": [request.lead_id],
                        "schedule_days": [0, 1, 2, 3, 4],  # 5-day drip campaign
                        "content": {
                            "quote_id": quote_data.get("quote_id"),
                            "rate": quote_data.get("interest_rate"),
                            "payment": quote_data.get("monthly_payment")
                        }
                    },
                    timeout=10.0
                )
                campaign_response.raise_for_status()
                campaign_data = campaign_response.json()
                campaign_id = campaign_data.get("id")
                next_action = "Campaign started - 5-day drip sequence"
        else:
            next_action = f"Workflow blocked: {compliance_check.reason}"

        return WorkflowResponse(
            workflow_id=workflow_id,
            lead_id=request.lead_id,
            quote_id=quote_data.get("quote_id", ""),
            campaign_id=campaign_id or "",
            compliance_status=compliance_check.classification.value,
            created_at=datetime.utcnow(),
            next_action=next_action
        )

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service communication error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Workflow creation failed: {str(e)}"
        )


@app.post("/compliance/check", response_model=ComplianceCheckResponse)
async def compliance_check(request: ComplianceCheckRequest):
    """Check compliance for a specific message"""
    result = check_compliance(request, consent_ledger)

    # Log audit trail
    audit_log = AuditLog(
        audit_id=result.audit_id,
        timestamp=datetime.utcnow(),
        lead_id=request.lead_id,
        action="compliance_check",
        classification=result.classification,
        details={
            "message_type": request.message_type.value,
            "consent_status": result.consent_status.value,
            "quiet_hours_violation": result.quiet_hours_violation,
            "opt_out_detected": result.opt_out_detected
        },
        compliance_passed=result.allowed
    )
    audit_logs.append(audit_log)

    return result


@app.post("/consent/add")
async def add_consent(
    lead_id: str,
    consent_type: ConsentType,
    phone: str,
    email: str
):
    """Add consent record for a lead"""
    consent_ledger.add_consent(lead_id, consent_type, phone, email)

    audit_log = AuditLog(
        audit_id=f"consent_{lead_id}_{datetime.utcnow().timestamp()}",
        timestamp=datetime.utcnow(),
        lead_id=lead_id,
        action="consent_added",
        classification="allowed",  # This is metadata, not a message classification
        details={
            "consent_type": consent_type.value,
            "phone": phone,
            "email": email
        },
        compliance_passed=True
    )
    audit_logs.append(audit_log)

    return {
        "status": "success",
        "lead_id": lead_id,
        "consent_type": consent_type.value
    }


@app.post("/consent/opt-out")
async def opt_out(lead_id: str):
    """Record opt-out for a lead (TCPA compliance - must honor immediately)"""
    consent_ledger.add_opt_out(lead_id)

    audit_log = AuditLog(
        audit_id=f"optout_{lead_id}_{datetime.utcnow().timestamp()}",
        timestamp=datetime.utcnow(),
        lead_id=lead_id,
        action="opt_out_recorded",
        classification="blocked",  # This is metadata
        details={
            "reason": "Lead opted out"
        },
        compliance_passed=False
    )
    audit_logs.append(audit_log)

    return {
        "status": "success",
        "lead_id": lead_id,
        "message": "Opt-out recorded. All communications blocked."
    }


@app.get("/audit/logs")
async def get_audit_logs(
    lead_id: Optional[str] = None,
    limit: int = 100
):
    """Retrieve audit logs (optionally filtered by lead_id)"""
    if lead_id:
        filtered_logs = [log for log in audit_logs if log.lead_id == lead_id]
        return {"logs": filtered_logs[-limit:]}

    return {"logs": audit_logs[-limit:]}


@app.get("/audit/stats")
async def get_audit_stats():
    """Get compliance statistics"""
    total_checks = len(audit_logs)
    if total_checks == 0:
        return {
            "total_checks": 0,
            "allowed": 0,
            "approval_required": 0,
            "blocked": 0,
            "compliance_rate": 0.0
        }

    allowed = sum(1 for log in audit_logs if log.compliance_passed)
    blocked = sum(1 for log in audit_logs if not log.compliance_passed)

    return {
        "total_checks": total_checks,
        "allowed": allowed,
        "blocked": blocked,
        "compliance_rate": round((allowed / total_checks) * 100, 2)
    }


# Integration endpoints for external services

@app.post("/integration/twentycrm/sync")
async def sync_to_twentycrm(lead_id: str, workflow_id: str):
    """Sync workflow data to TwentyCRM"""
    # Placeholder for TwentyCRM integration
    # In production, this would push lead and quote data to CRM
    return {
        "status": "success",
        "message": "Sync to TwentyCRM queued",
        "lead_id": lead_id,
        "workflow_id": workflow_id
    }


@app.post("/integration/n8n/webhook")
async def trigger_n8n_workflow(workflow_name: str, data: dict):
    """Trigger n8n workflow via webhook"""
    # Placeholder for n8n integration
    # In production, this would POST to n8n webhook endpoint
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{N8N_URL}/webhook/{workflow_name}",
                json=data,
                timeout=10.0
            )
            return {
                "status": "success",
                "workflow_name": workflow_name,
                "response": response.json()
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
