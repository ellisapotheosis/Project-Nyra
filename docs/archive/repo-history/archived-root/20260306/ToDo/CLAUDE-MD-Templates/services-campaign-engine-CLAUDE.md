# Campaign Engine - Mortgage Lead Drip Automation

## 🎯 SERVICE CONTEXT

**Purpose**: FastAPI service orchestrating compliant drip campaigns via n8n workflows, Twilio communications (SMS/voice/email), and intelligent campaign lifecycle management for Project Nyra.

**Port**: 8002  
**Language**: Python 3.11 + FastAPI + Celery + Redis  
**Dependencies**: n8n-py, twilio, sendgrid, celery, redis, aiohttp  
**Template**: CLAUDE-MD-Python.md (mesh topology for async workflow coordination)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Campaign Development Pattern
**MANDATORY**: All campaign types, communication channels, and workflows MUST be developed in parallel:

```python
# ✅ CORRECT: Batch campaign development in ONE message
[Single Message]:
  # Campaign type implementations
  - Write("app/campaigns/new_lead.py", newLeadCampaignLogic)
  - Write("app/campaigns/quote_followup.py", quoteFollowupLogic)
  - Write("app/campaigns/pre_approval.py", preApprovalNurture)
  - Write("app/campaigns/closing_reminders.py", closingReminderLogic)
  
  # Communication channel handlers
  - Write("app/channels/sms.py", twilioSMSHandler)
  - Write("app/channels/voice.py", twilioVoiceHandler)
  - Write("app/channels/email.py", sendgridEmailHandler)
  - Write("app/channels/missed_call.py", missedCallPingHandler)
  
  # n8n workflow integrations
  - Write("app/n8n/workflow_triggers.py", workflowTriggerClient)
  - Write("app/n8n/webhook_handlers.py", workflowWebhookHandlers)
  
  # Celery async tasks
  - Write("app/tasks/campaign_tasks.py", allCeleryTasks)
  
  # Run all tests in parallel
  - Bash("pytest -n auto tests/")

# ❌ WRONG: Sequential campaign type development
[Message 1]: Write new lead campaign
[Message 2]: Write quote followup campaign
[Message 3]: Write SMS handler
```

### Compliance-First Campaign Rules
**CRITICAL**: Every campaign communication MUST comply with:

- **TCPA (Telephone Consumer Protection Act)**: Prior express written consent required for automated calls/texts
- **CAN-SPAM Act**: Unsubscribe mechanism in every email, physical address disclosure
- **Do Not Call Registry**: Check against DNC list before calling
- **State Regulations**: Respect state-specific mortgage advertising rules
- **Time Restrictions**: No calls before 8 AM or after 9 PM borrower's local time
- **Opt-Out Honor**: Immediate removal from campaigns upon request
- **Content Accuracy**: No misleading claims about rates, terms, or approval likelihood
- **CFPB Marketing Rules**: Fair lending principles apply to all communications

## 📊 CAMPAIGN ENGINE ARCHITECTURE

### Campaign Lifecycle Flow
```
Lead Received → Consent Verification → Campaign Assignment → n8n Workflow Trigger
    ↓
Daily Schedule Check → Time Zone Validation → DNC Verification
    ↓
Communication Queue (Celery) → Channel Selection → Message Dispatch (Twilio/SendGrid)
    ↓
Response Monitoring → Engagement Tracking → Campaign Status Update
    ↓
If Engaged: End Campaign → Notify Loan Officer
If Not Engaged: Continue Schedule → Next Touchpoint
```

### Campaign Types

**1. New Lead Nurture Campaign**
- Duration: 14 days
- Touchpoints: 8 (Day 1, 1 hour later, Day 2, Day 4, Day 7, Day 10, Day 12, Day 14)
- Channels: SMS → Email → Voice → Missed Call Ping → Repeat
- Goal: Get borrower to respond and schedule consultation
- Termination: On first response from borrower OR after Day 14

**2. Quote Follow-Up Campaign**
- Duration: 7 days
- Touchpoints: 5 (immediate, 4 hours, Day 2, Day 4, Day 7)
- Channels: Email (quote PDF) → SMS (rate reminder) → Voice (personal call) → Email (rate expiration warning)
- Goal: Get borrower to submit full application
- Termination: On application submission OR after Day 7

**3. Pre-Approval Nurture Campaign**
- Duration: 30 days
- Touchpoints: 6 (Day 1, Day 7, Day 14, Day 21, Day 28, Day 30)
- Channels: Email (home search tips) → SMS (market updates) → Voice (check-in call)
- Goal: Keep pre-approved borrower engaged until home purchase
- Termination: On loan application OR after Day 30

**4. Closing Reminder Campaign**
- Duration: Until closing date
- Touchpoints: Varies (10 days before, 7 days, 3 days, 1 day, day of closing)
- Channels: Email (closing preparation) → SMS (document reminders) → Voice (closing confirmation)
- Goal: Ensure smooth closing process
- Termination: On successful closing

**5. Rate Alert Campaign**
- Duration: Ongoing (until opt-out)
- Touchpoints: Triggered by rate changes
- Channels: Email → SMS (if rate drops significantly)
- Goal: Re-engage past leads when rates improve
- Termination: On opt-out OR lead conversion

## 🐝 CAMPAIGN ENGINE SWARM

### Agent Configuration
```yaml
topology: mesh  # Optimal for workflow coordination
maxAgents: 6
strategy: parallel
language: python
framework: fastapi + celery

agents:
  campaign_orchestrator:
    role: Campaign Lifecycle Management
    focus: [workflow-coordination, schedule-management, state-tracking]
    responsibilities:
      - Design campaign state machines
      - Implement schedule management logic
      - Track campaign progression
      - Handle campaign termination conditions
    concurrent_tasks: [multiple-campaigns, parallel-schedules]

  communication_specialist:
    role: Multi-Channel Message Delivery
    focus: [twilio-integration, sendgrid-integration, message-templates]
    responsibilities:
      - Integrate Twilio for SMS/voice/missed-call-ping
      - Integrate SendGrid for transactional email
      - Create message templates with personalization
      - Handle delivery failures and retries
    concurrent_tasks: [multiple-channels, parallel-delivery]

  n8n_integration_engineer:
    role: Workflow Automation Integration
    focus: [n8n-api, webhook-handlers, workflow-triggers]
    responsibilities:
      - Create n8n workflow trigger endpoints
      - Implement webhook handlers for workflow callbacks
      - Design workflow data models
      - Handle workflow execution monitoring
    concurrent_tasks: [multiple-workflows, parallel-triggers]

  compliance_guardian:
    role: TCPA/CAN-SPAM/DNC Compliance
    focus: [consent-verification, dnc-checking, timing-rules]
    responsibilities:
      - Verify consent before each communication
      - Check Do Not Call registry before calls
      - Enforce time-of-day restrictions
      - Implement opt-out mechanisms
      - Validate content for fair lending compliance
    concurrent_tasks: [multiple-validations, parallel-checks]

  celery_task_architect:
    role: Async Task Queue Management
    focus: [celery-tasks, redis-broker, retry-logic]
    responsibilities:
      - Design Celery task workflows
      - Implement retry logic for failed communications
      - Configure Redis as message broker
      - Monitor task queue health
    concurrent_tasks: [multiple-tasks, parallel-execution]

  analytics_tracker:
    role: Campaign Performance Monitoring
    focus: [engagement-tracking, conversion-metrics, optimization]
    responsibilities:
      - Track campaign engagement rates
      - Measure conversion by touchpoint
      - Identify optimal send times
      - Generate performance reports
    concurrent_tasks: [multiple-metrics, parallel-analysis]
```

## 🔧 FASTAPI + CELERY PATTERNS

### Campaign State Machine
```python
from enum import Enum
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field
from celery import Celery

# Initialize Celery
celery_app = Celery(
    'nyra_campaigns',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

class CampaignStatus(str, Enum):
    """Campaign lifecycle states"""
    PENDING = "pending"           # Campaign created, not started
    ACTIVE = "active"             # Campaign running
    PAUSED = "paused"             # Temporarily paused
    COMPLETED = "completed"       # Finished successfully
    TERMINATED = "terminated"     # Ended early (borrower responded)
    FAILED = "failed"            # Failed due to errors
    OPTED_OUT = "opted_out"      # Borrower opted out

class CommunicationChannel(str, Enum):
    """Available communication channels"""
    SMS = "sms"
    VOICE = "voice"
    EMAIL = "email"
    MISSED_CALL_PING = "missed_call_ping"

class TouchpointStatus(str, Enum):
    """Individual touchpoint states"""
    SCHEDULED = "scheduled"
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RESPONDED = "responded"
    SKIPPED = "skipped"

class Touchpoint(BaseModel):
    """Represents a single communication in campaign"""
    id: str
    campaign_id: str
    lead_id: str
    sequence_number: int
    channel: CommunicationChannel
    scheduled_for: datetime
    status: TouchpointStatus = TouchpointStatus.SCHEDULED
    message_template: str
    message_variables: dict = {}
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    failed_reason: Optional[str] = None
    response_received: bool = False
    twilio_sid: Optional[str] = None  # For SMS/voice tracking
    sendgrid_message_id: Optional[str] = None  # For email tracking

class Campaign(BaseModel):
    """Represents complete campaign for a lead"""
    id: str
    lead_id: str
    campaign_type: str  # new_lead, quote_followup, pre_approval, etc.
    status: CampaignStatus = CampaignStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    touchpoints: List[Touchpoint] = []
    total_touchpoints: int
    completed_touchpoints: int = 0
    consent_verified: bool = False
    consent_timestamp: Optional[datetime] = None
    opt_out_requested: bool = False
    opt_out_timestamp: Optional[datetime] = None
    n8n_workflow_id: Optional[str] = None
    n8n_execution_id: Optional[str] = None

@celery_app.task(bind=True, max_retries=3)
def send_sms_touchpoint(self, touchpoint_id: str):
    """Celery task to send SMS via Twilio"""
    from twilio.rest import Client
    from app.services.compliance import verify_consent, check_dnc, is_valid_send_time
    
    # Load touchpoint from database
    touchpoint = get_touchpoint(touchpoint_id)
    
    # Compliance checks
    if not verify_consent(touchpoint.lead_id, CommunicationChannel.SMS):
        touchpoint.status = TouchpointStatus.SKIPPED
        touchpoint.failed_reason = "No SMS consent"
        update_touchpoint(touchpoint)
        return {"status": "skipped", "reason": "no_consent"}
    
    if check_dnc(touchpoint.lead_id):
        touchpoint.status = TouchpointStatus.SKIPPED
        touchpoint.failed_reason = "On Do Not Call list"
        update_touchpoint(touchpoint)
        return {"status": "skipped", "reason": "dnc_list"}
    
    lead = get_lead(touchpoint.lead_id)
    
    if not is_valid_send_time(lead.phone_number, datetime.now()):
        # Reschedule for next valid time (8 AM local time)
        next_valid_time = get_next_valid_send_time(lead.phone_number)
        send_sms_touchpoint.apply_async(args=[touchpoint_id], eta=next_valid_time)
        return {"status": "rescheduled", "eta": next_valid_time}
    
    try:
        # Send SMS via Twilio
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Personalize message
        message_text = render_template(
            touchpoint.message_template,
            **touchpoint.message_variables
        )
        
        # Send message
        message = client.messages.create(
            from_=TWILIO_PHONE_NUMBER,
            to=lead.phone_number,
            body=message_text
        )
        
        # Update touchpoint status
        touchpoint.status = TouchpointStatus.SENT
        touchpoint.sent_at = datetime.now()
        touchpoint.twilio_sid = message.sid
        update_touchpoint(touchpoint)
        
        # Schedule delivery confirmation check (5 minutes later)
        check_sms_delivery.apply_async(
            args=[touchpoint_id],
            countdown=300  # 5 minutes
        )
        
        return {"status": "sent", "sid": message.sid}
        
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@celery_app.task
def check_sms_delivery(touchpoint_id: str):
    """Check SMS delivery status with Twilio"""
    from twilio.rest import Client
    
    touchpoint = get_touchpoint(touchpoint_id)
    
    if not touchpoint.twilio_sid:
        return {"status": "no_sid"}
    
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages(touchpoint.twilio_sid).fetch()
        
        if message.status == 'delivered':
            touchpoint.status = TouchpointStatus.DELIVERED
            touchpoint.delivered_at = datetime.now()
            update_touchpoint(touchpoint)
            
            # Update campaign progress
            update_campaign_progress(touchpoint.campaign_id)
            
            return {"status": "delivered"}
        
        elif message.status in ['failed', 'undelivered']:
            touchpoint.status = TouchpointStatus.FAILED
            touchpoint.failed_reason = message.error_message
            update_touchpoint(touchpoint)
            
            return {"status": "failed", "reason": message.error_message}
        
        else:
            # Still in transit, check again later
            check_sms_delivery.apply_async(args=[touchpoint_id], countdown=300)
            return {"status": "pending"}
            
    except Exception as e:
        logger.error(f"Delivery check failed for {touchpoint_id}: {str(e)}")
        return {"status": "error"}

@app.post("/api/v1/campaigns/start")
async def start_campaign(
    lead_id: str,
    campaign_type: str,
    n8n_workflow_id: Optional[str] = None
):
    """Start a new drip campaign for a lead"""
    
    # Verify consent
    consent_verified = await verify_lead_consent(lead_id, all_channels=True)
    if not consent_verified:
        raise HTTPException(
            status_code=403,
            detail="Lead has not provided consent for automated communications"
        )
    
    # Check if lead already has active campaign of this type
    existing = await get_active_campaigns(lead_id, campaign_type)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Lead already has active {campaign_type} campaign"
        )
    
    # Load campaign template
    template = get_campaign_template(campaign_type)
    
    # Create campaign
    campaign = Campaign(
        id=generate_campaign_id(),
        lead_id=lead_id,
        campaign_type=campaign_type,
        status=CampaignStatus.ACTIVE,
        started_at=datetime.now(),
        total_touchpoints=len(template.touchpoints),
        consent_verified=True,
        consent_timestamp=datetime.now(),
        n8n_workflow_id=n8n_workflow_id
    )
    
    # Create touchpoints
    for idx, tp_template in enumerate(template.touchpoints):
        scheduled_time = datetime.now() + tp_template.delay
        
        touchpoint = Touchpoint(
            id=generate_touchpoint_id(),
            campaign_id=campaign.id,
            lead_id=lead_id,
            sequence_number=idx + 1,
            channel=tp_template.channel,
            scheduled_for=scheduled_time,
            message_template=tp_template.template,
            message_variables={
                "lead_first_name": lead.first_name,
                "lead_last_name": lead.last_name,
                "loan_officer_name": LOAN_OFFICER_NAME,
                "company_name": COMPANY_NAME,
                "company_phone": COMPANY_PHONE
            }
        )
        
        campaign.touchpoints.append(touchpoint)
        
        # Schedule touchpoint for delivery
        schedule_touchpoint_delivery(touchpoint)
    
    # Save campaign
    await save_campaign(campaign)
    
    # Trigger n8n workflow if provided
    if n8n_workflow_id:
        await trigger_n8n_workflow(
            workflow_id=n8n_workflow_id,
            campaign_id=campaign.id,
            lead_id=lead_id
        )
    
    return {
        "campaign_id": campaign.id,
        "status": "started",
        "total_touchpoints": campaign.total_touchpoints,
        "first_touchpoint_at": campaign.touchpoints[0].scheduled_for.isoformat()
    }

@app.post("/api/v1/campaigns/{campaign_id}/terminate")
async def terminate_campaign(campaign_id: str, reason: str):
    """Terminate campaign early (borrower responded or opted out)"""
    
    campaign = await get_campaign(campaign_id)
    
    if campaign.status not in [CampaignStatus.ACTIVE, CampaignStatus.PAUSED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot terminate campaign in {campaign.status} state"
        )
    
    # Cancel all future touchpoints
    for touchpoint in campaign.touchpoints:
        if touchpoint.status == TouchpointStatus.SCHEDULED:
            touchpoint.status = TouchpointStatus.SKIPPED
            touchpoint.failed_reason = f"Campaign terminated: {reason}"
            
            # Revoke Celery tasks
            revoke_touchpoint_task(touchpoint.id)
    
    # Update campaign status
    campaign.status = CampaignStatus.TERMINATED
    campaign.completed_at = datetime.now()
    
    await update_campaign(campaign)
    
    # Notify n8n workflow
    if campaign.n8n_workflow_id:
        await notify_n8n_workflow_termination(
            workflow_id=campaign.n8n_workflow_id,
            campaign_id=campaign_id,
            reason=reason
        )
    
    return {
        "campaign_id": campaign_id,
        "status": "terminated",
        "reason": reason,
        "completed_touchpoints": campaign.completed_touchpoints,
        "skipped_touchpoints": len([tp for tp in campaign.touchpoints if tp.status == TouchpointStatus.SKIPPED])
    }
```

### n8n Integration Pattern
```python
import aiohttp
from typing import Dict, Any

class N8nClient:
    """Client for triggering and monitoring n8n workflows"""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.session = None
    
    async def trigger_workflow(
        self,
        workflow_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Trigger n8n workflow execution"""
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/webhook/{workflow_id}",
                json=data,
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return {
                        "success": True,
                        "execution_id": result.get("executionId"),
                        "data": result
                    }
                else:
                    error_text = await response.text()
                    return {
                        "success": False,
                        "error": error_text,
                        "status_code": response.status
                    }
    
    async def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """Get status of workflow execution"""
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/executions/{execution_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": "Failed to fetch execution status"}
```

## 🔒 COMPLIANCE & SECURITY

### TCPA Consent Verification
```python
async def verify_consent(lead_id: str, channel: CommunicationChannel) -> bool:
    """Verify lead has provided consent for automated communications"""
    
    consent_record = await get_consent_record(lead_id)
    
    if not consent_record:
        return False
    
    # Check channel-specific consent
    if channel == CommunicationChannel.SMS:
        return consent_record.sms_consent and not consent_record.sms_opt_out
    elif channel == CommunicationChannel.VOICE:
        return consent_record.voice_consent and not consent_record.voice_opt_out
    elif channel == CommunicationChannel.EMAIL:
        return consent_record.email_consent and not consent_record.email_opt_out
    
    return False
```

### Do Not Call (DNC) Registry Check
```python
async def check_dnc_registry(phone_number: str) -> bool:
    """Check if phone number is on national Do Not Call registry"""
    
    # Integration with DNC list service
    # This would typically be a paid API service
    
    try:
        # Check internal DNC list first
        internal_dnc = await check_internal_dnc_list(phone_number)
        if internal_dnc:
            return True
        
        # Check national registry (via third-party API)
        # Example: https://www.donotcall.gov/
        result = await query_national_dnc_api(phone_number)
        
        return result.on_dnc_list
        
    except Exception as e:
        # On error, default to conservative approach
        logger.error(f"DNC check failed for {phone_number}: {str(e)}")
        return True  # Assume on list to be safe
```

### Time-of-Day Restrictions
```python
from datetime import time
from zoneinfo import ZoneInfo

async def is_valid_send_time(phone_number: str, current_time: datetime) -> bool:
    """Check if current time is valid for contacting lead (8 AM - 9 PM local)"""
    
    # Get lead's timezone from phone number
    timezone = await get_timezone_from_phone(phone_number)
    
    # Convert current time to lead's timezone
    local_time = current_time.astimezone(ZoneInfo(timezone))
    
    # Check if within allowed hours (8 AM - 9 PM)
    start_hour = time(8, 0)  # 8:00 AM
    end_hour = time(21, 0)   # 9:00 PM
    
    return start_hour <= local_time.time() <= end_hour
```

## 📈 PERFORMANCE TARGETS

### Campaign Processing
- Campaign start latency: < 200ms
- Touchpoint scheduling: < 50ms per touchpoint
- SMS delivery: < 3 seconds via Twilio
- Email delivery: < 5 seconds via SendGrid
- Voice call connect: < 10 seconds

### Celery Queue Management
- Redis broker latency: < 10ms
- Task queue depth: < 1000 pending tasks
- Worker count: 4-8 workers (auto-scale based on queue depth)
- Task retry limit: 3 attempts with exponential backoff

### n8n Workflow Coordination
- Workflow trigger latency: < 500ms
- Webhook response time: < 100ms
- Execution status check: < 200ms

## 🧪 TESTING REQUIREMENTS

### Campaign Logic Testing
```python
@pytest.mark.asyncio
async def test_campaign_terminates_on_response():
    """Test campaign auto-terminates when lead responds"""
    
    # Start new lead campaign
    campaign_id = await start_campaign(
        lead_id="test_lead_123",
        campaign_type="new_lead"
    )
    
    # Simulate lead responding to first touchpoint
    await handle_lead_response(
        lead_id="test_lead_123",
        response_channel="sms",
        response_text="Yes, I'm interested"
    )
    
    # Verify campaign terminated
    campaign = await get_campaign(campaign_id)
    assert campaign.status == CampaignStatus.TERMINATED
    
    # Verify future touchpoints were cancelled
    future_touchpoints = [
        tp for tp in campaign.touchpoints 
        if tp.status == TouchpointStatus.SCHEDULED
    ]
    assert len(future_touchpoints) == 0
```

---

**This service manages all automated borrower communications for Project Nyra. TCPA/CAN-SPAM/DNC compliance is mandatory - a single violation can result in $500-$1,500 fines per message. Always verify consent, respect opt-outs, and honor time restrictions.**
