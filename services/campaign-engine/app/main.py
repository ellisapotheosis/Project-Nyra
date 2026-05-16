"""
Campaign Engine - Mortgage Lead Drip Campaign Orchestration Service
=====================================================================
FastAPI service for managing automated 45-day mortgage lead campaigns
with multi-channel messaging (SMS, Email, Voice) and n8n integration.
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
from jinja2 import Template
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/nyra")
REDIS_URL = os.getenv("REDIS_URL", "redis://:redis@redis:6379/0")
N8N_WEBHOOK_BASE_URL = os.getenv("N8N_WEBHOOK_BASE_URL", "http://n8n:5678/webhook")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@ratehunter.com")

# Initialize FastAPI app
app = FastAPI(
    title="Nyra Campaign Engine",
    description="Mortgage lead drip campaign orchestration service with multi-channel messaging",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Database connection pool
db_pool: Optional[asyncpg.Pool] = None


# ============================================================================
# DATA MODELS
# ============================================================================

class CampaignType(str, Enum):
    """Campaign type enumeration"""
    DRIP_45_DAY = "45_day_drip"
    FOLLOW_UP = "follow_up"
    RATE_ALERT = "rate_alert"
    REENGAGEMENT = "reengagement"
    CUSTOM = "custom"


class CampaignStatus(str, Enum):
    """Campaign status enumeration"""
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class MessageChannel(str, Enum):
    """Message delivery channel enumeration"""
    SMS = "sms"
    EMAIL = "email"
    VOICE = "voice"


class CampaignTriggerRequest(BaseModel):
    """Request to trigger a new campaign"""
    borrower_id: str = Field(..., description="UUID of borrower to enroll in campaign")
    campaign_type: CampaignType = Field(default=CampaignType.DRIP_45_DAY, description="Type of campaign to trigger")
    start_immediately: bool = Field(default=True, description="Whether to start campaign immediately")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional campaign metadata")


class CampaignPauseRequest(BaseModel):
    """Request to pause a campaign"""
    borrower_id: str = Field(..., description="UUID of borrower whose campaign to pause")
    reason: Optional[str] = Field(default=None, description="Reason for pausing")


class CampaignResumeRequest(BaseModel):
    """Request to resume a paused campaign"""
    borrower_id: str = Field(..., description="UUID of borrower whose campaign to resume")


class MessageSendRequest(BaseModel):
    """Request to send a single message"""
    borrower_id: str = Field(..., description="UUID of borrower to send message to")
    channel: MessageChannel = Field(..., description="Delivery channel (sms, email, voice)")
    template_id: Optional[str] = Field(default=None, description="Template ID to use")
    custom_content: Optional[str] = Field(default=None, description="Custom message content")
    subject: Optional[str] = Field(default=None, description="Email subject (email only)")


class MessageTemplate(BaseModel):
    """Message template for campaigns"""
    name: str = Field(..., description="Template name")
    channel: MessageChannel = Field(..., description="Delivery channel")
    subject: Optional[str] = Field(default=None, description="Email subject template")
    content: str = Field(..., description="Message content with Jinja2 placeholders")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")


class CampaignResponse(BaseModel):
    """Response after campaign action"""
    status: str
    message: str
    campaign_id: Optional[str] = None
    borrower_id: str
    data: Optional[Dict[str, Any]] = None


# ============================================================================
# DATABASE FUNCTIONS
# ============================================================================

async def get_db_pool() -> asyncpg.Pool:
    """Get or create database connection pool"""
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=2,
            max_size=10,
            command_timeout=60
        )
    return db_pool


async def get_db_connection():
    """Get a database connection from pool"""
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        yield connection


async def get_borrower_data(borrower_id: str) -> Optional[Dict]:
    """Fetch borrower data from database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT b.*, q.loan_amount, q.interest_rate, q.loan_term, q.monthly_payment
            FROM borrowers b
            LEFT JOIN quotes q ON b.id = q.borrower_id
            WHERE b.id = $1
            ORDER BY q.created_at DESC
            LIMIT 1
            """,
            borrower_id
        )
        if row:
            return dict(row)
        return None


async def get_campaign(borrower_id: str) -> Optional[Dict]:
    """Get active campaign for borrower"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT * FROM campaigns
            WHERE borrower_id = $1
            AND status IN ('active', 'pending', 'paused')
            ORDER BY created_at DESC
            LIMIT 1
            """,
            borrower_id
        )
        if row:
            return dict(row)
        return None


async def create_campaign_record(borrower_id: str, campaign_type: str, metadata: Optional[Dict] = None) -> str:
    """Create a new campaign record in database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO campaigns (borrower_id, campaign_type, status, current_day, metadata, created_at)
            VALUES ($1, $2, 'active', 0, $3, NOW())
            RETURNING id
            """,
            borrower_id,
            campaign_type,
            json.dumps(metadata) if metadata else None
        )
        campaign_id = row['id']
        logger.info(f"Created campaign {campaign_id} for borrower {borrower_id}")
        return str(campaign_id)


async def update_campaign_status(borrower_id: str, status: str, reason: Optional[str] = None):
    """Update campaign status"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE campaigns
            SET status = $1, updated_at = NOW()
            WHERE borrower_id = $2
            AND status IN ('active', 'pending', 'paused')
            """,
            status,
            borrower_id
        )
        logger.info(f"Updated campaign status to {status} for borrower {borrower_id}")


async def log_message_sent(borrower_id: str, channel: str, content: str, status: str, metadata: Optional[Dict] = None):
    """Log message delivery to database"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO messages (borrower_id, channel, content, status, metadata, sent_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            """,
            borrower_id,
            channel,
            content,
            status,
            json.dumps(metadata) if metadata else None
        )


# ============================================================================
# N8N INTEGRATION
# ============================================================================

async def trigger_n8n_campaign(borrower_id: str, campaign_type: str) -> Dict:
    """Trigger n8n workflow for campaign"""
    webhook_url = f"{N8N_WEBHOOK_BASE_URL}/start-campaign"

    payload = {
        "borrower_id": borrower_id,
        "campaign_type": campaign_type,
        "triggered_at": datetime.utcnow().isoformat()
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            logger.info(f"Triggered n8n campaign for borrower {borrower_id}")
            return response.json()
    except Exception as e:
        logger.error(f"Failed to trigger n8n campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to trigger campaign: {str(e)}")


# ============================================================================
# TWILIO INTEGRATION (SMS & VOICE)
# ============================================================================

def get_twilio_client():
    """Initialize Twilio client"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        raise ValueError("Twilio credentials not configured")

    from twilio.rest import Client
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


async def send_sms(to_number: str, message: str, borrower_id: str) -> bool:
    """Send SMS via Twilio"""
    try:
        twilio_client = get_twilio_client()

        message_obj = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_number
        )

        await log_message_sent(
            borrower_id=borrower_id,
            channel="sms",
            content=message,
            status="sent",
            metadata={"twilio_sid": message_obj.sid}
        )

        logger.info(f"SMS sent to {to_number}, SID: {message_obj.sid}")
        return True

    except Exception as e:
        logger.error(f"Failed to send SMS: {str(e)}")
        await log_message_sent(
            borrower_id=borrower_id,
            channel="sms",
            content=message,
            status="failed",
            metadata={"error": str(e)}
        )
        return False


async def initiate_voice_call(to_number: str, message_url: str, borrower_id: str) -> bool:
    """Initiate voice call via Twilio"""
    try:
        twilio_client = get_twilio_client()

        call = twilio_client.calls.create(
            url=message_url,
            to=to_number,
            from_=TWILIO_PHONE_NUMBER
        )

        await log_message_sent(
            borrower_id=borrower_id,
            channel="voice",
            content=f"Voice call to {to_number}",
            status="initiated",
            metadata={"twilio_sid": call.sid}
        )

        logger.info(f"Voice call initiated to {to_number}, SID: {call.sid}")
        return True

    except Exception as e:
        logger.error(f"Failed to initiate voice call: {str(e)}")
        await log_message_sent(
            borrower_id=borrower_id,
            channel="voice",
            content=f"Voice call to {to_number}",
            status="failed",
            metadata={"error": str(e)}
        )
        return False


# ============================================================================
# SENDGRID INTEGRATION (EMAIL)
# ============================================================================

async def send_email(to_email: str, subject: str, content: str, borrower_id: str) -> bool:
    """Send email via SendGrid API"""
    if not SENDGRID_API_KEY:
        logger.error("SendGrid API key not configured")
        return False

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": SMTP_FROM_EMAIL, "name": "Nyra - RateHunter"},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": content}]
                }
            )

            response.raise_for_status()

            await log_message_sent(
                borrower_id=borrower_id,
                channel="email",
                content=content,
                status="sent",
                metadata={"subject": subject, "to": to_email}
            )

            logger.info(f"Email sent to {to_email}")
            return True

    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        await log_message_sent(
            borrower_id=borrower_id,
            channel="email",
            content=content,
            status="failed",
            metadata={"error": str(e), "subject": subject}
        )
        return False


# ============================================================================
# TEMPLATE RENDERING
# ============================================================================

async def render_template(template_content: str, borrower_data: Dict) -> str:
    """Render Jinja2 template with borrower data"""
    try:
        template = Template(template_content)
        rendered = template.render(**borrower_data)
        return rendered
    except Exception as e:
        logger.error(f"Template rendering failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Template rendering failed: {str(e)}")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database pool on startup"""
    await get_db_pool()
    logger.info("Campaign Engine started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database pool on shutdown"""
    if db_pool:
        await db_pool.close()
    logger.info("Campaign Engine shutdown")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "campaign-engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/campaign/trigger", response_model=CampaignResponse)
async def trigger_campaign(request: CampaignTriggerRequest, background_tasks: BackgroundTasks):
    """
    Trigger a new campaign for a borrower

    This endpoint:
    1. Validates borrower exists
    2. Creates campaign record in database
    3. Triggers n8n workflow in background
    4. Returns campaign ID immediately
    """
    # Validate borrower exists
    borrower = await get_borrower_data(request.borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail=f"Borrower {request.borrower_id} not found")

    # Check for existing active campaign
    existing_campaign = await get_campaign(request.borrower_id)
    if existing_campaign:
        return CampaignResponse(
            status="already_active",
            message=f"Borrower already has an active campaign",
            campaign_id=str(existing_campaign['id']),
            borrower_id=request.borrower_id,
            data={"existing_status": existing_campaign['status']}
        )

    # Create campaign record
    campaign_id = await create_campaign_record(
        borrower_id=request.borrower_id,
        campaign_type=request.campaign_type.value,
        metadata=request.metadata
    )

    # Trigger n8n workflow in background
    if request.start_immediately:
        background_tasks.add_task(
            trigger_n8n_campaign,
            request.borrower_id,
            request.campaign_type.value
        )

    return CampaignResponse(
        status="success",
        message="Campaign triggered successfully",
        campaign_id=campaign_id,
        borrower_id=request.borrower_id,
        data={"campaign_type": request.campaign_type.value}
    )


@app.post("/campaign/pause", response_model=CampaignResponse)
async def pause_campaign(request: CampaignPauseRequest):
    """
    Pause an active campaign

    Note: This pauses future messages but does not cancel scheduled n8n workflows.
    Use n8n dashboard to manually pause the workflow if needed.
    """
    campaign = await get_campaign(request.borrower_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="No active campaign found for borrower")

    if campaign['status'] == 'paused':
        return CampaignResponse(
            status="already_paused",
            message="Campaign is already paused",
            campaign_id=str(campaign['id']),
            borrower_id=request.borrower_id
        )

    await update_campaign_status(request.borrower_id, "paused", request.reason)

    return CampaignResponse(
        status="success",
        message="Campaign paused successfully",
        campaign_id=str(campaign['id']),
        borrower_id=request.borrower_id,
        data={"reason": request.reason}
    )


@app.post("/campaign/resume", response_model=CampaignResponse)
async def resume_campaign(request: CampaignResumeRequest):
    """
    Resume a paused campaign

    Note: This resumes the campaign status in database.
    Scheduled n8n workflows will continue from their current state.
    """
    campaign = await get_campaign(request.borrower_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="No campaign found for borrower")

    if campaign['status'] != 'paused':
        return CampaignResponse(
            status="not_paused",
            message=f"Campaign is {campaign['status']}, not paused",
            campaign_id=str(campaign['id']),
            borrower_id=request.borrower_id
        )

    await update_campaign_status(request.borrower_id, "active")

    return CampaignResponse(
        status="success",
        message="Campaign resumed successfully",
        campaign_id=str(campaign['id']),
        borrower_id=request.borrower_id
    )


@app.get("/campaign/{borrower_id}/status")
async def get_campaign_status(borrower_id: str):
    """Get current campaign status for a borrower"""
    campaign = await get_campaign(borrower_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="No campaign found for borrower")

    return {
        "borrower_id": borrower_id,
        "campaign_id": str(campaign['id']),
        "campaign_type": campaign['campaign_type'],
        "status": campaign['status'],
        "current_day": campaign['current_day'],
        "created_at": campaign['created_at'].isoformat() if campaign['created_at'] else None,
        "updated_at": campaign['updated_at'].isoformat() if campaign.get('updated_at') else None,
        "metadata": json.loads(campaign['metadata']) if campaign.get('metadata') else None
    }


@app.post("/message/send", response_model=CampaignResponse)
async def send_message(request: MessageSendRequest, background_tasks: BackgroundTasks):
    """
    Send a single message to a borrower

    Can use template_id or custom_content. Supports SMS, Email, and Voice channels.
    """
    # Get borrower data
    borrower = await get_borrower_data(request.borrower_id)
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    # Prepare message content
    if request.template_id:
        # Fetch template from database (simplified - you'd have a templates table)
        content = request.custom_content or "Template content would be loaded here"
    else:
        content = request.custom_content

    if not content:
        raise HTTPException(status_code=400, detail="Either template_id or custom_content required")

    # Render template with borrower data
    rendered_content = await render_template(content, borrower)

    # Send via appropriate channel
    success = False
    if request.channel == MessageChannel.SMS:
        if not borrower.get('phone'):
            raise HTTPException(status_code=400, detail="Borrower has no phone number")
        success = await send_sms(borrower['phone'], rendered_content, request.borrower_id)

    elif request.channel == MessageChannel.EMAIL:
        if not borrower.get('email'):
            raise HTTPException(status_code=400, detail="Borrower has no email address")
        subject = request.subject or "Message from RateHunter"
        success = await send_email(borrower['email'], subject, rendered_content, request.borrower_id)

    elif request.channel == MessageChannel.VOICE:
        if not borrower.get('phone'):
            raise HTTPException(status_code=400, detail="Borrower has no phone number")
        # Voice requires TwiML URL - simplified implementation
        message_url = "http://demo.twilio.com/docs/voice.xml"  # Replace with actual TwiML endpoint
        success = await initiate_voice_call(borrower['phone'], message_url, request.borrower_id)

    return CampaignResponse(
        status="success" if success else "failed",
        message=f"Message {'sent' if success else 'failed'} via {request.channel}",
        borrower_id=request.borrower_id,
        data={"channel": request.channel.value, "success": success}
    )


@app.get("/templates")
async def list_templates():
    """List all available message templates"""
    # Simplified - would query templates table
    return {
        "templates": [
            {
                "id": "welcome_email",
                "name": "Welcome Email",
                "channel": "email",
                "description": "Initial welcome email with quote details"
            },
            {
                "id": "day3_sms",
                "name": "Day 3 SMS Check-in",
                "channel": "sms",
                "description": "Quick check-in SMS on day 3"
            }
        ]
    }


@app.post("/templates")
async def create_template(template: MessageTemplate):
    """Create a new message template"""
    # Simplified - would insert into templates table
    return {
        "status": "success",
        "message": "Template created",
        "template_id": f"tmpl_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("CAMPAIGN_ENGINE_PORT", 8002)),
        reload=True,
        log_level="info"
    )
