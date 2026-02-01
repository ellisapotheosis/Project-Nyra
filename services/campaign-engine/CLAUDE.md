# Campaign Engine - Drip Campaign Automation Service

## 🎯 SERVICE CONTEXT

**Purpose**: FastAPI service for automated drip campaigns, email/SMS scheduling, borrower communication sequences, compliance-first marketing automation.

**Port**: 8002 | **Language**: Python 3.11 + FastAPI
**Dependencies**: fastapi, celery, redis, twilio, sendgrid, n8n-client, sqlalchemy

## 🚨 CRITICAL RULES

### Compliance-First Development
Every campaign MUST include regulatory compliance:
- **TCPA**: Prior express written consent for SMS/calls, immediate opt-out
- **CAN-SPAM**: Physical address in emails, clear unsubscribe, honor within 10 days
- **TILA/RESPA**: No misleading rates, proper APR disclosure
- **Opt-Out**: Redis-backed blocklist, permanent tracking
- **Time-Zone**: Send 8am-9pm borrower local time only
- **Audit Logging**: Every campaign action with timestamp, recipient, hash

### Async Patterns (MANDATORY)
```python
# ✅ FastAPI endpoints + Celery background tasks
@router.post("/campaigns")
async def create_campaign(req: CampaignCreate, background_tasks: BackgroundTasks):
    campaign = await create_campaign_db(req)
    background_tasks.add_task(send_campaign_step.delay, campaign.id, 1)
    return CampaignResponse.from_orm(campaign)

# ✅ Celery tasks with retry + error handling
@celery.task(bind=True, max_retries=3, default_retry_delay=300)
def send_email_task(self, campaign_id: int, step: int):
    try:
        send_email(...)  # I/O operation
    except RateLimitError as e:
        self.retry(exc=e, countdown=e.retry_after)
```

## 📊 ARCHITECTURE

**Campaign Flow**:
Trigger (n8n/scheduled) → Check opt-out (Redis) → Load sequence → Render template → Validate compliance (TCPA/CAN-SPAM) → Queue Celery task → Send (Twilio/SendGrid) → Log + schedule next step

**Campaign Types**:
1. **Pre-Approval Nurture**: Day 1-14 onboarding sequence
2. **Post-Quote Follow-Up**: Day 1-10 rate/lock reminders
3. **Abandoned Application**: Day 1-14 re-engagement
4. **Document Collection**: Day 1-10 collection + escalation

## 🔧 FASTAPI + CELERY PATTERNS

### Campaign Creation with Compliance
```python
@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    req: CampaignCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    # Validate TCPA consent
    if not req.borrower.tcpa_consent_given_at:
        raise HTTPException(400, "Missing TCPA consent")

    # Check opt-out status
    if await is_opted_out(req.borrower_id):
        raise HTTPException(403, "Borrower opted out")

    # Create campaign
    campaign = await create_campaign_db(db, req)

    # Queue first step
    background_tasks.add_task(send_campaign_email.delay, campaign.id, 1)

    return CampaignResponse.from_orm(campaign)
```

### Celery Task with Retry Logic
```python
@celery.task(bind=True, max_retries=3, default_retry_delay=300)
def send_campaign_email(self, campaign_id: int, step_number: int):
    try:
        campaign = get_campaign(campaign_id)
        borrower = campaign.borrower

        # Check opt-out again
        if await is_opted_out(borrower.id):
            return "skipped_opted_out"

        # Render + send
        template = campaign.get_step_template(step_number)
        content = render_template(template, borrower=borrower)
        result = send_email(to=borrower.email, subject=content['subject'], html=content['html'])

        # Log success + schedule next
        log_campaign_action(campaign_id, step_number, "sent", result.message_id)
        next_step = campaign.get_next_step(step_number)
        if next_step:
            send_campaign_email.apply_async(
                kwargs={'campaign_id': campaign_id, 'step_number': next_step.number},
                eta=next_step.scheduled_at
            )

    except RateLimitError as e:
        self.retry(exc=e, countdown=e.retry_after)
    except Exception as e:
        self.retry(exc=e, countdown=2 ** self.request.retries * 60)
```

### Opt-Out Handler (Immediate CAN-SPAM/TCPA)
```python
@router.post("/opt-out/email/{email}")
async def opt_out_email(email: str, db: AsyncSession = Depends(get_db)):
    """CAN-SPAM: Must process within 10 business days."""
    await add_to_optout_list(db, email, method="email")
    await remove_all_campaigns(db, email)
    await redis_client.sadd("optout:emails", email.lower())
    return {"message": "Unsubscribed from all future emails"}

@router.post("/opt-out/sms/{phone}")
async def opt_out_sms(phone: str, db: AsyncSession = Depends(get_db)):
    """TCPA STOP: Must process immediately."""
    phone_normalized = normalize_phone(phone)
    await add_to_optout_list(db, phone_normalized, method="sms")
    await remove_all_campaigns(db, phone=phone_normalized)
    await redis_client.sadd("optout:phones", phone_normalized)
    await send_sms(phone_normalized, "Unsubscribed. Reply START to re-subscribe.")
    return {"message": "Opted out successfully"}
```

## 🧪 TESTING

```python
import pytest
from app.tasks import send_campaign_email
from app.services.optout_service import add_to_optout_list

@pytest.mark.asyncio
async def test_respects_optout():
    """Campaign should skip opted-out borrowers."""
    borrower = await create_test_borrower()
    await add_to_optout_list(borrower.email)

    result = await send_campaign_email(campaign_id=1, step_number=1)
    assert result == "skipped_opted_out"

@pytest.mark.asyncio
async def test_tcpa_consent_required():
    """SMS campaigns require TCPA consent."""
    borrower = await create_test_borrower(tcpa_consent=False)

    with pytest.raises(HTTPException) as e:
        await create_campaign(borrower_id=borrower.id, channel="sms")

    assert e.value.status_code == 400
```

## 📈 PERFORMANCE TARGETS

- Email delivery: <30s | SMS delivery: <5s | Processing: >1000 msgs/min
- Opt-out: <1s (Redis) | Template render: <50ms | n8n webhook: <200ms
- Compliance: 100% opt-out honored, 100% TCPA validation, 100% audit logging

---

**Every campaign action is logged. Every opt-out honored immediately. TCPA/CAN-SPAM compliance is non-negotiable.**
