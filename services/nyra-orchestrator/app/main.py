"""
Nyra Orchestrator - Main Orchestration Service
===============================================
Central orchestration service for mortgage lead processing with:
- Compliance validation (RESPA, TILA, ECOA, FCRA, HMDA, ATR, SAFE Act)
- Memory system integration (Letta, Mem0, Neo4j/FalkorDB)
- Audit logging and human escalation
- Quote Engine and Campaign Engine coordination
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import asyncpg
import httpx
import os
import logging
import json
from uuid import uuid4

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/nyra")
REDIS_URL = os.getenv("REDIS_URL", "redis://:redis@redis:6379/0")
QUOTE_ENGINE_URL = os.getenv("QUOTE_ENGINE_URL", "http://quote-engine:8001")
CAMPAIGN_ENGINE_URL = os.getenv("CAMPAIGN_ENGINE_URL", "http://campaign-engine:8002")
LETTA_API_URL = os.getenv("LETTA_API_URL", "http://letta:8283")
MEM0_API_URL = os.getenv("MEM0_API_URL", "http://mem0-rest-api:8003")
NEO4J_URL = os.getenv("NEO4J_URL", "bolt://neo4j:7687")
TWENTYCRM_API_URL = os.getenv("TWENTYCRM_API_URL", "http://twentycrm:3000/graphql")

# Initialize FastAPI app — disable interactive docs in production
_is_production = os.getenv("ENVIRONMENT", "development") == "production"
app = FastAPI(
    title="Nyra Orchestrator",
    description="Central orchestration service for mortgage lead processing with compliance validation",
    version="1.0.0",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc"
)

# CORS middleware — restrict origins; wildcard + credentials is insecure
_cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"]
)

# Database connection pool
db_pool: Optional[asyncpg.Pool] = None


# ============================================================================
# DATA MODELS
# ============================================================================

class ComplianceStatus(str, Enum):
    """Compliance check status"""
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"
    PENDING = "pending"


class EscalationPriority(str, Enum):
    """Human escalation priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class LeadRequest(BaseModel):
    """Lead submission request"""
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str = Field(..., pattern=r"^\+?1?\d{10,15}$")
    loan_amount: float = Field(..., gt=0)
    property_value: float = Field(..., gt=0)
    credit_score: Optional[int] = Field(default=None, ge=300, le=850)
    loan_purpose: str = Field(default="purchase")
    property_type: str = Field(default="single_family")
    occupancy: str = Field(default="primary")
    metadata: Optional[Dict[str, Any]] = Field(default=None)


class LeadResponse(BaseModel):
    """Lead processing response"""
    lead_id: str
    borrower_id: str
    status: str
    compliance_status: ComplianceStatus
    compliance_issues: List[Dict[str, Any]]
    quote_id: Optional[str] = None
    campaign_id: Optional[str] = None
    crm_id: Optional[str] = None
    escalated: bool = False
    created_at: datetime


class ComplianceCheckRequest(BaseModel):
    """Compliance validation request"""
    borrower_id: str
    lead_data: Dict[str, Any]


class ComplianceCheckResponse(BaseModel):
    """Compliance validation response"""
    borrower_id: str
    compliant: bool
    status: ComplianceStatus
    issues: List[Dict[str, Any]]
    critical_count: int
    high_count: int
    medium_count: int
    timestamp: datetime


class EscalationRequest(BaseModel):
    """Human escalation request"""
    borrower_id: str
    priority: EscalationPriority
    reason: str
    context: Dict[str, Any]


class AuditLogEntry(BaseModel):
    """Audit log entry"""
    entity_type: str
    entity_id: str
    action: str
    actor: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime


# ============================================================================
# DATABASE FUNCTIONS
# ============================================================================

async def get_db_pool() -> asyncpg.Pool:
    """Get or create database connection pool"""
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
    return db_pool


async def create_borrower(lead_data: LeadRequest) -> str:
    """Create borrower record in database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        borrower_id = str(uuid4())
        await conn.execute(
            """
            INSERT INTO borrowers (
                id, first_name, last_name, email, phone,
                loan_amount, property_value, credit_score,
                loan_purpose, property_type, occupancy,
                metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            """,
            borrower_id,
            lead_data.first_name,
            lead_data.last_name,
            lead_data.email,
            lead_data.phone,
            lead_data.loan_amount,
            lead_data.property_value,
            lead_data.credit_score,
            lead_data.loan_purpose,
            lead_data.property_type,
            lead_data.occupancy,
            json.dumps(lead_data.metadata) if lead_data.metadata else None
        )
        logger.info(f"Created borrower {borrower_id}")
        return borrower_id


async def log_audit_event(entity_type: str, entity_id: str, action: str, actor: str, details: Optional[Dict] = None):
    """Log audit event to database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO audit_logs (entity_type, entity_id, action, actor, details, timestamp)
            VALUES ($1, $2, $3, $4, $5, NOW())
            """,
            entity_type,
            entity_id,
            action,
            actor,
            json.dumps(details) if details else None
        )


async def create_escalation(borrower_id: str, priority: str, reason: str, context: Dict):
    """Create human escalation record"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        escalation_id = str(uuid4())
        await conn.execute(
            """
            INSERT INTO human_escalations (id, borrower_id, priority, reason, context, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
            """,
            escalation_id,
            borrower_id,
            priority,
            reason,
            json.dumps(context)
        )
        logger.warning(f"Created {priority} escalation {escalation_id} for borrower {borrower_id}: {reason}")
        return escalation_id


async def save_compliance_check(borrower_id: str, compliant: bool, issues: List[Dict], counts: Dict):
    """Save compliance check results"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO compliance_events (
                borrower_id, compliant, issues_detail,
                critical_issues, high_issues, medium_issues,
                timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            """,
            borrower_id,
            compliant,
            json.dumps(issues),
            counts.get('critical', 0),
            counts.get('high', 0),
            counts.get('medium', 0)
        )


# ============================================================================
# COMPLIANCE VALIDATION
# ============================================================================

async def validate_compliance(borrower_id: str, lead_data: Dict) -> Dict:
    """
    Comprehensive compliance validation

    Checks:
    - RESPA: Disclosure timing requirements
    - TILA: Truth in Lending Act disclosures
    - ECOA: Equal Credit Opportunity Act
    - FCRA: Fair Credit Reporting Act (consent)
    - HMDA: Home Mortgage Disclosure Act data
    - ATR: Ability to Repay (DTI validation)
    - SAFE Act: Loan officer NMLS verification
    """
    issues = []

    # RESPA Compliance - Disclosure timing
    if not lead_data.get('disclosure_sent'):
        issues.append({
            "type": "RESPA",
            "severity": "high",
            "message": "Initial disclosures not sent within 3 business days",
            "regulation": "12 CFR 1024.7"
        })

    # TILA Compliance - Truth in Lending disclosures
    if not lead_data.get('tila_disclosure'):
        issues.append({
            "type": "TILA",
            "severity": "high",
            "message": "TILA disclosure required before consummation",
            "regulation": "15 USC 1638"
        })

    # ECOA Compliance - Adverse action notices
    if lead_data.get('credit_score') and lead_data['credit_score'] < 620:
        if not lead_data.get('adverse_action_notice_sent'):
            issues.append({
                "type": "ECOA",
                "severity": "critical",
                "message": "Adverse action notice required within 30 days",
                "regulation": "15 USC 1691(d)"
            })

    # FCRA Compliance - Credit pull consent
    if not lead_data.get('fcra_consent'):
        issues.append({
            "type": "FCRA",
            "severity": "critical",
            "message": "Credit report consent not obtained",
            "regulation": "15 USC 1681b"
        })

    # HMDA Compliance - Demographic data collection
    required_hmda_fields = ['ethnicity', 'race', 'sex']
    missing_hmda = [f for f in required_hmda_fields if not lead_data.get(f)]
    if missing_hmda:
        issues.append({
            "type": "HMDA",
            "severity": "medium",
            "message": f"Missing HMDA data: {', '.join(missing_hmda)}",
            "regulation": "12 CFR 1003"
        })

    # ATR Compliance - Ability to Repay (DTI check)
    if lead_data.get('income') and lead_data.get('loan_amount'):
        monthly_income = lead_data['income'] / 12
        estimated_payment = lead_data['loan_amount'] * 0.005  # Rough estimate
        dti = (estimated_payment / monthly_income) * 100

        if dti > 43:
            issues.append({
                "type": "ATR",
                "severity": "high",
                "message": f"DTI ratio {dti:.1f}% exceeds 43% threshold",
                "regulation": "12 CFR 1026.43"
            })

    # SAFE Act Compliance - Loan officer NMLS
    if not lead_data.get('loan_officer_nmls'):
        issues.append({
            "type": "SAFE_ACT",
            "severity": "critical",
            "message": "Loan officer NMLS ID not recorded",
            "regulation": "12 USC 5103"
        })

    # Count by severity
    counts = {
        'critical': len([i for i in issues if i['severity'] == 'critical']),
        'high': len([i for i in issues if i['severity'] == 'high']),
        'medium': len([i for i in issues if i['severity'] == 'medium'])
    }

    compliant = counts['critical'] == 0 and counts['high'] == 0

    return {
        'compliant': compliant,
        'issues': issues,
        'counts': counts
    }


# ============================================================================
# EXTERNAL SERVICE INTEGRATION
# ============================================================================

async def call_quote_engine(borrower_id: str, lead_data: Dict) -> Optional[Dict]:
    """Call Quote Engine to generate mortgage quote"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{QUOTE_ENGINE_URL}/quote/generate",
                json={
                    "borrower_id": borrower_id,
                    "loan_amount": lead_data.get('loan_amount'),
                    "property_value": lead_data.get('property_value'),
                    "credit_score": lead_data.get('credit_score'),
                    "loan_purpose": lead_data.get('loan_purpose', 'purchase')
                }
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Generated quote for borrower {borrower_id}")
            return result
    except Exception as e:
        logger.error(f"Quote Engine call failed: {str(e)}")
        return None


async def trigger_campaign(borrower_id: str) -> Optional[Dict]:
    """Trigger 45-day drip campaign"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{CAMPAIGN_ENGINE_URL}/campaign/trigger",
                json={
                    "borrower_id": borrower_id,
                    "campaign_type": "45_day_drip",
                    "start_immediately": True
                }
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Triggered campaign for borrower {borrower_id}")
            return result
    except Exception as e:
        logger.error(f"Campaign Engine call failed: {str(e)}")
        return None


async def sync_to_crm(borrower_id: str, lead_data: Dict) -> Optional[str]:
    """Sync lead to TwentyCRM"""
    try:
        mutation = """
        mutation CreateLead($input: LeadInput!) {
            createLead(input: $input) {
                id
                email
            }
        }
        """

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                TWENTYCRM_API_URL,
                json={
                    "query": mutation,
                    "variables": {
                        "input": {
                            "firstName": lead_data.get('first_name'),
                            "lastName": lead_data.get('last_name'),
                            "email": lead_data.get('email'),
                            "phone": lead_data.get('phone'),
                            "loanAmount": lead_data.get('loan_amount')
                        }
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            crm_id = result.get('data', {}).get('createLead', {}).get('id')
            logger.info(f"Synced borrower {borrower_id} to CRM: {crm_id}")
            return crm_id
    except Exception as e:
        logger.error(f"CRM sync failed: {str(e)}")
        return None


async def store_in_memory(borrower_id: str, context: str, metadata: Dict):
    """Store context in Letta memory system"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{LETTA_API_URL}/memory/add",
                json={
                    "user_id": borrower_id,
                    "content": context,
                    "metadata": metadata
                }
            )
            response.raise_for_status()
            logger.info(f"Stored memory for borrower {borrower_id}")
    except Exception as e:
        logger.error(f"Memory storage failed: {str(e)}")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database pool on startup"""
    await get_db_pool()
    logger.info("Nyra Orchestrator started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database pool on shutdown"""
    if db_pool:
        await db_pool.close()
    logger.info("Nyra Orchestrator shutdown")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "nyra-orchestrator",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/leads/process", response_model=LeadResponse)
async def process_lead(lead: LeadRequest, background_tasks: BackgroundTasks):
    """
    Process new lead through complete orchestration pipeline

    Flow:
    1. Create borrower record
    2. Run compliance validation
    3. Generate quote (if compliant)
    4. Trigger campaign (if quote generated)
    5. Sync to CRM
    6. Store context in memory
    7. Create escalation if needed
    8. Log all actions
    """
    # Create borrower
    borrower_id = await create_borrower(lead)

    # Log lead submission
    await log_audit_event("borrower", borrower_id, "lead_submitted", "system", {
        "email": lead.email,
        "loan_amount": lead.loan_amount
    })

    # Run compliance validation
    lead_dict = lead.dict()
    lead_dict['borrower_id'] = borrower_id
    compliance_result = await validate_compliance(borrower_id, lead_dict)

    # Save compliance results
    await save_compliance_check(
        borrower_id,
        compliance_result['compliant'],
        compliance_result['issues'],
        compliance_result['counts']
    )

    # Determine compliance status
    if compliance_result['counts']['critical'] > 0:
        compliance_status = ComplianceStatus.FAILED
    elif compliance_result['counts']['high'] > 0:
        compliance_status = ComplianceStatus.WARNING
    else:
        compliance_status = ComplianceStatus.PASSED

    quote_id = None
    campaign_id = None
    crm_id = None
    escalated = False

    # Generate quote if compliant
    if compliance_result['compliant']:
        quote_result = await call_quote_engine(borrower_id, lead_dict)
        if quote_result:
            quote_id = quote_result.get('quote_id')
            await log_audit_event("quote", quote_id, "generated", "system", {"borrower_id": borrower_id})

    # Trigger campaign if quote generated
    if quote_id:
        campaign_result = await trigger_campaign(borrower_id)
        if campaign_result:
            campaign_id = campaign_result.get('campaign_id')
            await log_audit_event("campaign", campaign_id, "triggered", "system", {"borrower_id": borrower_id})

    # Sync to CRM in background
    background_tasks.add_task(sync_to_crm, borrower_id, lead_dict)

    # Store in memory system in background
    memory_context = f"Lead submitted: {lead.first_name} {lead.last_name}, loan amount ${lead.loan_amount:,.0f}"
    background_tasks.add_task(store_in_memory, borrower_id, memory_context, {"event": "lead_submission"})

    # Create escalation if critical compliance issues
    if compliance_result['counts']['critical'] > 0:
        escalation_id = await create_escalation(
            borrower_id,
            "critical",
            "Critical compliance violations detected",
            {
                "issues": compliance_result['issues'],
                "counts": compliance_result['counts']
            }
        )
        escalated = True
        await log_audit_event("escalation", escalation_id, "created", "system", {"priority": "critical"})

    return LeadResponse(
        lead_id=borrower_id,
        borrower_id=borrower_id,
        status="processed",
        compliance_status=compliance_status,
        compliance_issues=compliance_result['issues'],
        quote_id=quote_id,
        campaign_id=campaign_id,
        crm_id=crm_id,
        escalated=escalated,
        created_at=datetime.utcnow()
    )


@app.post("/compliance/check", response_model=ComplianceCheckResponse)
async def check_compliance(request: ComplianceCheckRequest):
    """
    Run compliance validation on lead data

    Validates against RESPA, TILA, ECOA, FCRA, HMDA, ATR, and SAFE Act requirements
    """
    result = await validate_compliance(request.borrower_id, request.lead_data)

    # Save results
    await save_compliance_check(
        request.borrower_id,
        result['compliant'],
        result['issues'],
        result['counts']
    )

    # Log compliance check
    await log_audit_event("borrower", request.borrower_id, "compliance_checked", "system", {
        "compliant": result['compliant'],
        "issue_count": len(result['issues'])
    })

    # Determine status
    if result['counts']['critical'] > 0:
        status = ComplianceStatus.FAILED
    elif result['counts']['high'] > 0:
        status = ComplianceStatus.WARNING
    else:
        status = ComplianceStatus.PASSED

    return ComplianceCheckResponse(
        borrower_id=request.borrower_id,
        compliant=result['compliant'],
        status=status,
        issues=result['issues'],
        critical_count=result['counts']['critical'],
        high_count=result['counts']['high'],
        medium_count=result['counts']['medium'],
        timestamp=datetime.utcnow()
    )


@app.post("/escalation/create")
async def create_escalation_endpoint(request: EscalationRequest):
    """Create human escalation for manual review"""
    escalation_id = await create_escalation(
        request.borrower_id,
        request.priority.value,
        request.reason,
        request.context
    )

    await log_audit_event("escalation", escalation_id, "created", "api", {
        "priority": request.priority.value,
        "reason": request.reason
    })

    return {
        "status": "success",
        "escalation_id": escalation_id,
        "borrower_id": request.borrower_id,
        "priority": request.priority.value
    }


@app.get("/escalations/pending")
async def list_pending_escalations():
    """List all pending escalations for human review"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT e.*, b.first_name, b.last_name, b.email
            FROM human_escalations e
            JOIN borrowers b ON e.borrower_id = b.id
            WHERE e.status = 'pending'
            ORDER BY
                CASE e.priority
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                e.created_at ASC
            """
        )

        escalations = []
        for row in rows:
            escalations.append({
                "id": str(row['id']),
                "borrower_id": str(row['borrower_id']),
                "borrower_name": f"{row['first_name']} {row['last_name']}",
                "email": row['email'],
                "priority": row['priority'],
                "reason": row['reason'],
                "context": json.loads(row['context']) if row['context'] else {},
                "created_at": row['created_at'].isoformat()
            })

        return {"escalations": escalations, "count": len(escalations)}


class ToolCallEntry(BaseModel):
    """Assistant tool call entry"""
    tool_name: str
    arguments: Dict[str, Any]
    assistant_id: Optional[str] = "nyra-assistant"
    lead_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


@app.post("/audit/tool-call")
async def log_tool_call_endpoint(entry: ToolCallEntry):
    """Log an assistant tool call for audit purposes"""
    await log_audit_event(
        "assistant",
        entry.assistant_id,
        f"tool_call:{entry.tool_name}",
        "assistant",
        {
            "arguments": entry.arguments,
            "lead_id": entry.lead_id,
            "timestamp": entry.timestamp.isoformat()
        }
    )
    
    # Also log to a specialized tool_calls table if it exists (or just audit_logs for now)
    logger.info(f"Assistant tool call logged: {entry.tool_name} for lead {entry.lead_id}")
    
    return {"status": "success"}


@app.get("/audit/logs/{entity_id}")
async def get_audit_logs(entity_id: str, limit: int = 50):
    """Get audit logs for an entity"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM audit_logs
            WHERE entity_id = $1
            ORDER BY timestamp DESC
            LIMIT $2
            """,
            entity_id,
            limit
        )

        logs = []
        for row in rows:
            logs.append({
                "entity_type": row['entity_type'],
                "entity_id": row['entity_id'],
                "action": row['action'],
                "actor": row['actor'],
                "details": json.loads(row['details']) if row['details'] else {},
                "timestamp": row['timestamp'].isoformat()
            })

        return {"logs": logs, "count": len(logs)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("ORCHESTRATOR_PORT", 8010)),
        reload=True,
        log_level="info"
    )
