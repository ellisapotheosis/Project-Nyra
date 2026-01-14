# Nyra Orchestrator Service

Compliance-aware workflow orchestration for mortgage lead generation.

## Features

- **Workflow Coordination**: Orchestrates Quote Engine and Campaign Engine
- **TCPA Compliance**: Enforces quiet hours (9am-9pm), consent requirements, opt-out handling
- **Regulatory Compliance**: Validates RESPA, TILA, ATR requirements
- **Audit Logging**: Complete audit trail of all compliance checks
- **Integration Hub**: Connects to TwentyCRM, n8n, Letta, and other services

## API Endpoints

### Workflow Management
- `POST /workflow/create` - Create complete workflow (quote + compliance + campaign)
- `GET /health` - Health check

### Compliance
- `POST /compliance/check` - Check compliance for a specific message
- `POST /consent/add` - Add consent record
- `POST /consent/opt-out` - Record opt-out

### Audit
- `GET /audit/logs` - Retrieve audit logs
- `GET /audit/stats` - Get compliance statistics

### Integration
- `POST /integration/twentycrm/sync` - Sync to TwentyCRM
- `POST /integration/n8n/webhook` - Trigger n8n workflow

## Compliance Rules

### TCPA (Telephone Consumer Protection Act)
- Express written consent required for autodialed SMS/calls
- Quiet hours: 9 AM - 9 PM local time
- Opt-out keywords honored immediately

### Regulatory Frameworks
- **RESPA**: Closing cost disclosure
- **TILA**: APR disclosure
- **ECOA**: Anti-discrimination
- **FCRA**: Credit report usage
- **HMDA**: Reporting requirements
- **ATR**: Income verification
- **SAFE**: Loan originator licensing

## Environment Variables

- `QUOTE_ENGINE_URL` - Quote Engine service URL (default: http://quote-engine:8001)
- `CAMPAIGN_ENGINE_URL` - Campaign Engine service URL (default: http://campaign-engine:8002)
- `TWENTYCRM_URL` - TwentyCRM URL (default: http://twentycrm:3000)
- `N8N_URL` - n8n URL (default: http://n8n:5678)

## Running

### Docker
```bash
docker build -t nyra-orchestrator .
docker run -p 8010:8010 nyra-orchestrator
```

### Local Development
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8010
```

## Integration Example

```python
import httpx

# Create workflow for new lead
response = await httpx.post("http://localhost:8010/workflow/create", json={
    "lead_id": "lead_123",
    "phone": "+15555551234",
    "email": "john@example.com",
    "name": "John Doe",
    "loan_amount": 400000,
    "property_value": 500000,
    "credit_score": 740,
    "loan_type": "conventional",
    "timezone": "America/New_York"
})

workflow = response.json()
# Returns: workflow_id, quote_id, campaign_id, compliance_status
```

## Deployment

Deployed on PC4 (GPU Worker 3) as part of the business services stack.

Port: 8010
Health Check: http://localhost:8010/health
