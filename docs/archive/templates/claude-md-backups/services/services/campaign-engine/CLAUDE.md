# Campaign Engine - Drip Campaign Automation Service

## 🎯 SERVICE CONTEXT

**Purpose**: Python FastAPI service for automated drip campaigns, email/SMS scheduling, borrower communication sequences, and compliance-first marketing automation for Project Nyra mortgage operations.

**Port**: 8002
**Language**: Python 3.11 + FastAPI
**Dependencies**: fastapi, celery, redis, twilio, sendgrid, n8n-client, sqlalchemy
**Template**: Python/FastAPI backend service (mesh topology for parallel campaign processing)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel FastAPI Development Pattern
**MANDATORY**: All campaign endpoints, tasks, and integrations MUST be developed in parallel:

```python
# ✅ CORRECT: Batch development in ONE message
[Single Message]:
  // Campaign endpoints
  - Write("app/api/campaigns.py", campaignCRUD)
  - Write("app/api/sequences.py", sequenceManagement)
  - Write("app/api/schedules.py", scheduleEndpoints)

  // Background tasks
  - Write("app/tasks/email_sender.py", emailCeleryTasks)
  - Write("app/tasks/sms_sender.py", smsCeleryTasks)
  - Write("app/tasks/campaign_processor.py", campaignLogic)

  // Integrations
  - Write("app/integrations/twilio.py", twilioClient)
  - Write("app/integrations/sendgrid.py", sendgridClient)
  - Write("app/integrations/n8n.py", n8nWebhooks)

  // Tests
  - Write("tests/test_campaigns.py", campaignTests)
  - Bash("pytest tests/")
```

### Compliance-First Campaign Rules
**CRITICAL**: Every campaign feature MUST include regulatory compliance:

- **TCPA Compliance**: Prior express written consent for SMS/calls, proper opt-out handling
- **CAN-SPAM Compliance**: Physical address in emails, clear unsubscribe links, honor opt-outs within 10 days
- **TILA/RESPA**: No misleading rate information, proper APR disclosure in quotes
- **State Regulations**: DNC lists, state-specific consent requirements
- **Opt-Out Tracking**: Redis-backed opt-out list, permanent blocklist
- **Time-Zone Aware**: Send campaigns in borrower's local time zone (8am-9pm only)
- **Audit Logging**: Log every campaign action with timestamp, recipient, content hash

## 📊 CAMPAIGN ENGINE ARCHITECTURE

### Campaign Execution Flow
```
Campaign Trigger (n8n webhook or scheduled)
    ↓
Check Opt-Out Status (Redis cache) → If opted out: SKIP
    ↓
Load Campaign Sequence from DB → Get next step in drip sequence
    ↓
Render Template with Borrower Data → Personalize content
    ↓
Validate Compliance (TCPA/CAN-SPAM) → Check consent, time zone, frequency limits
    ↓
Queue to Celery Task → email_task or sms_task
    ↓
Send via Provider (Twilio/SendGrid) → Track delivery status
    ↓
Update Campaign State in DB → Record sent, opened, clicked, converted
    ↓
Schedule Next Step → If multi-step sequence, queue next message
```

### Campaign Types

**1. Pre-Approval Nurture**
- Day 1: Welcome + credit check reminder
- Day 3: Pre-approval benefits
- Day 7: Next steps guide
- Day 14: Check-in + offer assistance

**2. Post-Quote Follow-Up**
- Day 1: Quote recap + lender comparison
- Day 2: Rate lock reminder
- Day 5: Additional programs available
- Day 10: Competitive rate alert

**3. Abandoned Application**
- Day 1: Resume application link
- Day 3: Common questions answered
- Day 7: Personal assistance offer
- Day 14: Final reminder

**4. Document Collection**
- Day 1: Required documents list
- Day 3: Upload reminder
- Day 7: Escalation to loan officer
- Day 10: Phone call trigger

## 🐝 CAMPAIGN ENGINE SWARM

### Agent Configuration
```yaml
topology: mesh  # Parallel campaign processing
maxAgents: 6
strategy: specialized
language: python
framework: fastapi

agents:
  campaign_architect:
    role: Campaign Strategy Design
    focus: [drip-sequences, trigger-logic, personalization]
    responsibilities:
      - Design campaign sequences
      - Define trigger conditions
      - Implement personalization logic
      - Optimize send times
    concurrent_tasks: [multiple-campaigns, parallel-sequences]

  integration_specialist:
    role: External Service Integration
    focus: [twilio-api, sendgrid-api, n8n-webhooks]
    responsibilities:
      - Integrate Twilio SDK
      - Integrate SendGrid API
      - Handle n8n webhooks
      - Manage API rate limits
    concurrent_tasks: [multiple-providers, parallel-requests]

  compliance_guardian:
    role: Regulatory Compliance
    focus: [tcpa-validation, can-spam-compliance, opt-out-handling]
    responsibilities:
      - Validate TCPA consent
      - Enforce CAN-SPAM rules
      - Manage opt-out lists
      - Ensure time-zone compliance
    concurrent_tasks: [multiple-validations, parallel-checks]

  celery_engineer:
    role: Background Task Development
    focus: [async-tasks, retry-logic, error-handling]
    responsibilities:
      - Implement Celery tasks
      - Handle retries and failures
      - Monitor task queues
      - Optimize task performance
    concurrent_tasks: [multiple-tasks, parallel-execution]

  template_designer:
    role: Email/SMS Template Management
    focus: [jinja2-templates, dynamic-content, a-b-testing]
    responsibilities:
      - Design email templates
      - Create SMS templates
      - Implement dynamic content
      - Support A/B testing
    concurrent_tasks: [multiple-templates, parallel-rendering]

  test_engineer:
    role: Campaign Testing
    focus: [pytest, mock-twilio, mock-sendgrid]
    responsibilities:
      - Write campaign tests
      - Mock external APIs
      - Test compliance logic
      - Load test campaign processing
    concurrent_tasks: [multiple-test-suites, parallel-execution]
```

## 🔧 FASTAPI + CELERY PATTERNS

### Campaign Endpoint with Validation
```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.schemas import CampaignCreate, CampaignResponse
from app.services.campaign_service import create_campaign
from app.dependencies import get_db, get_current_user
from app.tasks import process_campaign_step

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.post("", response_model=CampaignResponse, status_code=201)
async def create_new_campaign(
    campaign: CampaignCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new drip campaign for a borrower.

    Validates:
    - Borrower has given TCPA consent
    - Borrower is not on opt-out list
    - Campaign schedule is compliance-friendly
    """
    # Validate consent
    if not campaign.borrower.has_tcpa_consent:
        raise HTTPException(
            status_code=400,
            detail="Borrower has not provided TCPA consent for automated messages"
        )

    # Check opt-out status
    if await is_opted_out(campaign.borrower_id):
        raise HTTPException(
            status_code=403,
            detail="Borrower has opted out of communications"
        )

    # Create campaign
    new_campaign = await create_campaign(db, campaign, current_user.id)

    # Queue first step
    background_tasks.add_task(
        process_campaign_step.delay,
        campaign_id=new_campaign.id,
        step_number=1
    )

    return CampaignResponse.from_orm(new_campaign)
```

### Celery Task with Retry Logic
```python
from celery import Task
from app.celery_app import celery
from app.integrations.sendgrid import send_email
from app.models import CampaignLog

class CallbackTask(Task):
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        # Log failure
        campaign_id = kwargs.get('campaign_id')
        logger.error(f"Campaign {campaign_id} failed: {exc}")

@celery.task(
    bind=True,
    base=CallbackTask,
    max_retries=3,
    default_retry_delay=300  # 5 minutes
)
def send_campaign_email(self, campaign_id: int, step_number: int):
    try:
        # Load campaign data
        campaign = get_campaign(campaign_id)
        borrower = campaign.borrower

        # Check opt-out again (in case changed since queueing)
        if is_opted_out(borrower.id):
            logger.info(f"Borrower {borrower.id} opted out, skipping")
            return

        # Render template
        template = campaign.get_step_template(step_number)
        content = render_template(template, borrower=borrower)

        # Send email
        result = send_email(
            to=borrower.email,
            subject=content['subject'],
            html=content['html'],
            text=content['text'],
            tracking_id=f"campaign-{campaign_id}-step-{step_number}"
        )

        # Log success
        log_campaign_action(
            campaign_id=campaign_id,
            step_number=step_number,
            status="sent",
            provider_id=result.message_id,
            sent_at=datetime.utcnow()
        )

        # Schedule next step
        next_step = campaign.get_next_step(step_number)
        if next_step:
            send_campaign_email.apply_async(
                kwargs={'campaign_id': campaign_id, 'step_number': next_step.number},
                eta=next_step.scheduled_at
            )

    except RateLimitError as exc:
        # Retry after rate limit resets
        self.retry(exc=exc, countdown=exc.retry_after)
    except Exception as exc:
        # Retry with exponential backoff
        self.retry(exc=exc, countdown=2 ** self.request.retries * 60)
```

### Opt-Out Handler
```python
from fastapi import APIRouter
from app.services.optout_service import add_to_optout_list, remove_all_campaigns
from app.cache import redis_client

router = APIRouter(prefix="/opt-out", tags=["opt-out"])

@router.post("/email/{email}")
async def opt_out_email(email: str):
    """
    Handle email opt-out request (CAN-SPAM compliance).
    Must process within 10 business days.
    """
    # Add to opt-out list (Redis + DB)
    await add_to_optout_list(email, method="email")

    # Remove from all active campaigns
    await remove_all_campaigns(email)

    # Add to Redis blacklist (fast lookup)
    await redis_client.sadd("optout:emails", email.lower())

    return {"message": "You have been unsubscribed from all future emails"}

@router.post("/sms/{phone}")
async def opt_out_sms(phone: str):
    """
    Handle SMS opt-out (STOP keyword) - TCPA compliance.
    Must process immediately.
    """
    # Normalize phone number
    phone_normalized = normalize_phone(phone)

    # Add to opt-out list
    await add_to_optout_list(phone_normalized, method="sms")

    # Remove from all campaigns
    await remove_all_campaigns(phone=phone_normalized)

    # Add to Redis blacklist
    await redis_client.sadd("optout:phones", phone_normalized)

    # Send confirmation SMS
    await send_sms(
        to=phone_normalized,
        body="You have been unsubscribed. Reply START to re-subscribe."
    )

    return {"message": "Opted out successfully"}
```

## 🔒 COMPLIANCE & SECURITY

### TCPA Consent Validation
```python
async def validate_tcpa_consent(borrower_id: int) -> bool:
    """
    Validate borrower has provided prior express written consent
    for automated calls/texts (TCPA requirement).
    """
    borrower = await get_borrower(borrower_id)

    # Check consent record
    if not borrower.tcpa_consent_given_at:
        return False

    # Check consent is still valid
    if borrower.tcpa_consent_revoked_at:
        return False

    # Check consent includes phone number
    if not borrower.tcpa_consent_phone:
        return False

    return True
```

## 📈 PERFORMANCE TARGETS

### Campaign Performance
- Email delivery: < 30 seconds from trigger to send
- SMS delivery: < 5 seconds from trigger to send
- Campaign processing: > 1000 messages/minute throughput
- Opt-out processing: < 1 second (immediate Redis update)
- Template rendering: < 50ms per template
- n8n webhook response: < 200ms

### Compliance Targets
- Opt-out honored: 100% immediate for SMS, within 10 business days for email
- TCPA consent validation: 100% before first message
- Time-zone compliance: 100% within 8am-9pm local time
- Audit log completeness: 100% of campaign actions logged

## 🧪 TESTING REQUIREMENTS

```python
import pytest
from app.tasks import send_campaign_email
from app.services.optout_service import is_opted_out

@pytest.mark.asyncio
async def test_campaign_respects_optout():
    # Given: Borrower is on opt-out list
    borrower = await create_test_borrower()
    await add_to_optout_list(borrower.email)

    # When: Campaign is triggered
    campaign = await create_campaign(borrower_id=borrower.id)

    # Then: Campaign should not send
    result = await send_campaign_email(campaign.id, step_number=1)
    assert result == "skipped_opted_out"

@pytest.mark.asyncio
async def test_tcpa_consent_required():
    # Given: Borrower without TCPA consent
    borrower = await create_test_borrower(tcpa_consent=False)

    # When: Trying to create SMS campaign
    with pytest.raises(HTTPException) as exc:
        await create_campaign(
            borrower_id=borrower.id,
            channel="sms"
        )

    # Then: Should fail with compliance error
    assert exc.value.status_code == 400
    assert "TCPA consent" in exc.value.detail
```

---

**This service automates borrower communication while maintaining strict regulatory compliance. Every campaign action is logged, every opt-out is honored immediately, and every message respects TCPA/CAN-SPAM requirements. Non-compliance is not an option.**
