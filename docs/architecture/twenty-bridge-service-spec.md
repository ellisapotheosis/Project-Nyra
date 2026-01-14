# Twenty-Bridge Service Specification

## Service Overview

**Name**: Twenty-Bridge
**Port**: 8020
**Type**: REST API + Webhook Processor
**Language**: Python 3.11+
**Framework**: FastAPI
**Database**: PostgreSQL 16

## Directory Structure

```
services/twenty-bridge/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and environment variables
│   ├── models/
│   │   ├── __init__.py
│   │   ├── crm.py             # TwentyCRM data models
│   │   ├── graph.py           # Graphiti entity models
│   │   ├── sync.py            # Sync state models
│   │   └── webhook.py         # Webhook payload models
│   ├── api/
│   │   ├── __init__.py
│   │   ├── webhooks.py        # Webhook endpoints
│   │   ├── sync.py            # Manual sync endpoints
│   │   ├── query.py           # Query/context endpoints
│   │   └── admin.py           # Admin/monitoring endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── webhook_processor.py   # Webhook validation & processing
│   │   ├── sync_engine.py         # Core sync logic
│   │   ├── graph_mapper.py        # CRM to Graph transformation
│   │   ├── crm_client.py          # TwentyCRM API client
│   │   └── graphiti_client.py     # Graphiti MCP client
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py      # Database connection pool
│   │   ├── migrations/        # SQL migration scripts
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_field_mappings.sql
│   │   │   └── 003_audit_tables.sql
│   │   └── queries.py         # Prepared SQL queries
│   ├── workers/
│   │   ├── __init__.py
│   │   ├── event_worker.py    # Background event processor
│   │   └── reconciliation_worker.py  # Batch sync worker
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── crypto.py          # Encryption utilities
│   │   ├── validation.py      # Data validation
│   │   └── logging.py         # Structured logging
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py            # JWT authentication
│       └── rate_limit.py      # Rate limiting
├── tests/
│   ├── __init__.py
│   ├── test_webhooks.py
│   ├── test_sync_engine.py
│   ├── test_graph_mapper.py
│   └── fixtures/
│       └── sample_data.json
├── Dockerfile
├── docker-compose.test.yml
├── requirements.txt
├── requirements-dev.txt
├── pytest.ini
├── .env.example
└── README.md
```

## Core Components

### 1. Main Application (main.py)

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api import webhooks, sync, query, admin
from app.config import settings
from app.database import init_db
from app.middleware import auth, rate_limit
from app.workers import event_worker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Twenty-Bridge",
    description="TwentyCRM to Graphiti synchronization service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.add_middleware(rate_limit.RateLimitMiddleware)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# Startup/shutdown events
@app.on_event("startup")
async def startup():
    logger.info("Starting Twenty-Bridge service")
    await init_db()
    event_worker.start()
    logger.info("Twenty-Bridge service started")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down Twenty-Bridge service")
    event_worker.stop()
    logger.info("Twenty-Bridge service stopped")

# Health check
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "twenty-bridge",
        "version": "1.0.0"
    }

# Include routers
app.include_router(webhooks.router, prefix="/webhook", tags=["webhooks"])
app.include_router(sync.router, prefix="/api/v1/sync", tags=["sync"])
app.include_router(query.router, prefix="/api/v1/leads", tags=["query"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
```

### 2. Configuration (config.py)

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Service
    SERVICE_NAME: str = "twenty-bridge"
    SERVICE_PORT: int = 8020
    LOG_LEVEL: str = "INFO"

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    WEBHOOK_SECRET: str

    # TwentyCRM
    TWENTY_BASE_URL: str = "http://twenty:3000"
    TWENTY_API_KEY: str
    TWENTY_WEBHOOK_SECRET: str

    # Graphiti
    GRAPHITI_BASE_URL: str = "http://graphiti_mcp:8000"
    GRAPHITI_GROUP_ID: str = "nyra"

    # Database
    DB_HOST: str = "twenty_bridge_postgres"
    DB_PORT: int = 5432
    DB_NAME: str = "twenty_bridge"
    DB_USER: str = "bridge_user"
    DB_PASSWORD: str
    DB_POOL_SIZE: int = 20

    # Redis (for caching and rate limiting)
    REDIS_HOST: str = "falkordb"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 1

    # Sync Configuration
    SYNC_BATCH_SIZE: int = 100
    SYNC_RETRY_MAX: int = 3
    SYNC_RETRY_DELAY_SECONDS: int = 30
    CACHE_TTL_SECONDS: int = 300

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://nyra-orchestrator:8010"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 3. Webhook Processor (services/webhook_processor.py)

```python
import hmac
import hashlib
import time
from typing import Dict, Any, Optional
from fastapi import HTTPException, Header
from pydantic import ValidationError

from app.config import settings
from app.models.webhook import WebhookPayload, WebhookEvent
from app.database.queries import insert_event
from app.utils.logging import get_logger

logger = get_logger(__name__)

class WebhookProcessor:
    """Process and validate incoming webhooks from TwentyCRM"""

    def __init__(self):
        self.secret = settings.TWENTY_WEBHOOK_SECRET

    def verify_signature(
        self,
        payload: bytes,
        signature: str,
        timestamp: str
    ) -> bool:
        """Verify HMAC-SHA256 signature from TwentyCRM"""

        # Check timestamp (prevent replay attacks)
        try:
            ts = int(timestamp)
            current_ts = int(time.time())
            if abs(current_ts - ts) > 300:  # 5 minute window
                logger.warning(f"Timestamp validation failed: {ts} vs {current_ts}")
                return False
        except (ValueError, TypeError):
            logger.error(f"Invalid timestamp: {timestamp}")
            return False

        # Verify HMAC signature
        expected_sig = hmac.new(
            self.secret.encode(),
            f"{timestamp}.{payload.decode()}".encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_sig, signature)

    async def process_webhook(
        self,
        event_type: str,
        payload: Dict[str, Any],
        signature: str,
        timestamp: str
    ) -> Dict[str, Any]:
        """Process validated webhook event"""

        logger.info(f"Processing webhook: {event_type}")

        try:
            # Validate payload structure
            webhook_event = WebhookEvent(
                event_type=event_type,
                payload=payload,
                timestamp=timestamp
            )

            # Insert into event queue
            event_id = await insert_event(
                event_type=event_type,
                payload=webhook_event.model_dump(),
                status="pending"
            )

            logger.info(f"Event queued: {event_id}")

            return {
                "status": "accepted",
                "event_id": event_id,
                "message": f"Event {event_type} queued for processing"
            }

        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid payload: {e}")
        except Exception as e:
            logger.error(f"Error processing webhook: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal processing error")

    def handle_lead_created(self, payload: Dict[str, Any]) -> None:
        """Handle lead.created event"""
        logger.info(f"Processing lead.created: {payload.get('id')}")
        # Implementation in sync_engine

    def handle_lead_updated(self, payload: Dict[str, Any]) -> None:
        """Handle lead.updated event"""
        logger.info(f"Processing lead.updated: {payload.get('id')}")
        # Implementation in sync_engine

    def handle_application_created(self, payload: Dict[str, Any]) -> None:
        """Handle application.created event"""
        logger.info(f"Processing application.created: {payload.get('id')}")
        # Implementation in sync_engine

webhook_processor = WebhookProcessor()
```

### 4. Sync Engine (services/sync_engine.py)

```python
from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio

from app.services.crm_client import crm_client
from app.services.graphiti_client import graphiti_client
from app.services.graph_mapper import graph_mapper
from app.database.queries import (
    get_sync_state,
    update_sync_state,
    get_field_mappings,
    insert_audit_record
)
from app.utils.logging import get_logger

logger = get_logger(__name__)

class SyncEngine:
    """Core synchronization logic between CRM and Graph"""

    async def sync_lead(
        self,
        lead_id: str,
        operation: str = "upsert"
    ) -> Dict[str, Any]:
        """Sync a single lead from CRM to Graph"""

        logger.info(f"Syncing lead {lead_id} (operation: {operation})")

        try:
            # 1. Fetch lead data from TwentyCRM
            crm_lead = await crm_client.get_lead(lead_id)
            if not crm_lead:
                logger.warning(f"Lead {lead_id} not found in CRM")
                return {"status": "not_found", "lead_id": lead_id}

            # 2. Get current sync state
            sync_state = await get_sync_state("lead", lead_id)

            # 3. Check if update needed (based on version/checksum)
            if sync_state and self._is_up_to_date(crm_lead, sync_state):
                logger.info(f"Lead {lead_id} already up to date")
                return {"status": "up_to_date", "lead_id": lead_id}

            # 4. Transform CRM data to Graph entities
            graph_entities = await graph_mapper.map_lead_to_graph(crm_lead)

            # 5. Upsert entities in Graphiti
            results = []
            for entity in graph_entities:
                result = await graphiti_client.upsert_entity(entity)
                results.append(result)

            # 6. Sync relationships
            relationships = await graph_mapper.extract_relationships(crm_lead)
            for rel in relationships:
                await graphiti_client.create_relationship(rel)

            # 7. Update sync state
            await update_sync_state(
                entity_type="lead",
                entity_id=lead_id,
                crm_version=crm_lead.get("version", 1),
                graph_version=results[0].get("version", 1),
                checksum=self._compute_checksum(crm_lead)
            )

            # 8. Audit trail
            await insert_audit_record(
                entity_type="lead",
                entity_id=lead_id,
                operation=operation,
                source="crm",
                changes=crm_lead
            )

            logger.info(f"Successfully synced lead {lead_id}")
            return {
                "status": "synced",
                "lead_id": lead_id,
                "entities_created": len(results),
                "relationships_created": len(relationships)
            }

        except Exception as e:
            logger.error(f"Error syncing lead {lead_id}: {e}", exc_info=True)
            return {"status": "error", "lead_id": lead_id, "error": str(e)}

    async def sync_application(
        self,
        app_id: str,
        operation: str = "upsert"
    ) -> Dict[str, Any]:
        """Sync a mortgage application from CRM to Graph"""

        logger.info(f"Syncing application {app_id}")

        try:
            # Similar logic to sync_lead but for applications
            crm_app = await crm_client.get_application(app_id)
            if not crm_app:
                return {"status": "not_found", "app_id": app_id}

            # Transform and sync
            graph_entities = await graph_mapper.map_application_to_graph(crm_app)
            results = []

            for entity in graph_entities:
                result = await graphiti_client.upsert_entity(entity)
                results.append(result)

            # Sync application-specific relationships
            # - Link to borrower/co-borrower
            # - Link to property
            # - Link to loan officer
            relationships = await graph_mapper.extract_application_relationships(crm_app)
            for rel in relationships:
                await graphiti_client.create_relationship(rel)

            await update_sync_state(
                entity_type="application",
                entity_id=app_id,
                crm_version=crm_app.get("version", 1),
                graph_version=results[0].get("version", 1),
                checksum=self._compute_checksum(crm_app)
            )

            return {
                "status": "synced",
                "app_id": app_id,
                "entities_created": len(results),
                "relationships_created": len(relationships)
            }

        except Exception as e:
            logger.error(f"Error syncing application {app_id}: {e}", exc_info=True)
            return {"status": "error", "app_id": app_id, "error": str(e)}

    async def batch_sync(
        self,
        entity_type: str,
        entity_ids: List[str]
    ) -> Dict[str, Any]:
        """Batch sync multiple entities"""

        logger.info(f"Batch syncing {len(entity_ids)} {entity_type}s")

        results = {
            "total": len(entity_ids),
            "synced": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }

        # Process in batches
        batch_size = 50
        for i in range(0, len(entity_ids), batch_size):
            batch = entity_ids[i:i+batch_size]
            tasks = []

            for entity_id in batch:
                if entity_type == "lead":
                    task = self.sync_lead(entity_id)
                elif entity_type == "application":
                    task = self.sync_application(entity_id)
                else:
                    continue
                tasks.append(task)

            # Execute batch concurrently
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in batch_results:
                if isinstance(result, Exception):
                    results["failed"] += 1
                    results["errors"].append(str(result))
                elif result.get("status") == "synced":
                    results["synced"] += 1
                elif result.get("status") == "up_to_date":
                    results["skipped"] += 1
                else:
                    results["failed"] += 1
                    results["errors"].append(result.get("error", "Unknown error"))

        logger.info(f"Batch sync complete: {results}")
        return results

    def _is_up_to_date(self, crm_data: Dict[str, Any], sync_state: Dict[str, Any]) -> bool:
        """Check if entity is up to date based on checksum"""
        current_checksum = self._compute_checksum(crm_data)
        return current_checksum == sync_state.get("checksum")

    def _compute_checksum(self, data: Dict[str, Any]) -> str:
        """Compute checksum for change detection"""
        import hashlib
        import json
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode()).hexdigest()

sync_engine = SyncEngine()
```

### 5. Graph Mapper (services/graph_mapper.py)

```python
from typing import Dict, Any, List
from datetime import datetime

from app.models.graph import GraphEntity, GraphRelationship
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

class GraphMapper:
    """Transform CRM data to Graphiti entities and relationships"""

    async def map_lead_to_graph(self, crm_lead: Dict[str, Any]) -> List[GraphEntity]:
        """Transform CRM lead to Graph entities"""

        entities = []

        # Main lead entity
        lead_entity = GraphEntity(
            entity_type="MortgageLead",
            name=crm_lead.get("name", "Unknown"),
            attributes={
                "crmId": crm_lead["id"],
                "email": crm_lead.get("email"),
                "phone": crm_lead.get("phone"),
                "stage": crm_lead.get("stage"),
                "priority": crm_lead.get("priority"),
                "creditScore": crm_lead.get("estimated_credit_score"),
                "income": crm_lead.get("annual_income"),
                "leadSource": crm_lead.get("lead_source"),
                "leadDate": crm_lead.get("lead_date"),
                "preferredChannel": crm_lead.get("preferred_channel"),
                "firstTimeHomeBuyer": crm_lead.get("first_time_home_buyer")
            },
            metadata={
                "source": "twentycrm",
                "lastUpdated": datetime.utcnow().isoformat(),
                "verificationLevel": self._get_verification_level(crm_lead)
            }
        )
        entities.append(lead_entity)

        # Create interaction entities from notes/activities
        if crm_lead.get("last_note"):
            interaction = GraphEntity(
                entity_type="CustomerInteraction",
                name=f"Note - {crm_lead['name']}",
                attributes={
                    "interactionId": f"note_{crm_lead['id']}_{int(datetime.utcnow().timestamp())}",
                    "channel": "crm_note",
                    "direction": "inbound",
                    "summary": crm_lead["last_note"],
                    "sentiment": self._analyze_sentiment(crm_lead["last_note"]),
                    "intent": "general_inquiry",
                    "timestamp": crm_lead.get("last_activity_date", datetime.utcnow().isoformat())
                }
            )
            entities.append(interaction)

        return entities

    async def map_application_to_graph(self, crm_app: Dict[str, Any]) -> List[GraphEntity]:
        """Transform CRM application to Graph entities"""

        entities = []

        # Main application entity
        app_entity = GraphEntity(
            entity_type="LoanApplication",
            name=f"Loan {crm_app.get('loan_number', crm_app['id'])}",
            attributes={
                "applicationId": crm_app["id"],
                "crmId": crm_app["id"],
                "loanNumber": crm_app.get("loan_number"),
                "loanAmount": crm_app.get("loan_amount"),
                "loanType": crm_app.get("loan_type"),
                "loanPurpose": crm_app.get("loan_purpose"),
                "propertyAddress": crm_app.get("property_address"),
                "propertyType": crm_app.get("property_type"),
                "stage": crm_app.get("stage"),
                "closingDate": crm_app.get("target_closing_date"),
                "priority": crm_app.get("priority")
            },
            metadata={
                "source": "twentycrm",
                "lastUpdated": datetime.utcnow().isoformat(),
                "complianceStatus": self._check_compliance(crm_app)
            }
        )
        entities.append(app_entity)

        # Property entity
        if crm_app.get("property_address"):
            property_entity = GraphEntity(
                entity_type="Property",
                name=crm_app["property_address"],
                attributes={
                    "address": crm_app["property_address"],
                    "propertyType": crm_app.get("property_type"),
                    "estimatedValue": crm_app.get("property_value"),
                    "occupancyType": crm_app.get("occupancy_type")
                }
            )
            entities.append(property_entity)

        return entities

    async def extract_relationships(self, crm_lead: Dict[str, Any]) -> List[GraphRelationship]:
        """Extract relationships from CRM lead data"""

        relationships = []
        lead_id = crm_lead["id"]

        # Lead -> Loan Officer
        if crm_lead.get("loan_officer_id"):
            relationships.append(GraphRelationship(
                relationship_type="ASSIGNED_TO",
                from_entity_id=f"MortgageLead:{lead_id}",
                to_entity_id=f"LoanOfficer:{crm_lead['loan_officer_id']}",
                attributes={
                    "role": "loan_officer",
                    "assignedDate": crm_lead.get("assignment_date", datetime.utcnow().isoformat())
                }
            ))

        # Lead -> Interaction
        if crm_lead.get("last_note"):
            interaction_id = f"note_{lead_id}_{int(datetime.utcnow().timestamp())}"
            relationships.append(GraphRelationship(
                relationship_type="PARTICIPATED_IN",
                from_entity_id=f"MortgageLead:{lead_id}",
                to_entity_id=f"CustomerInteraction:{interaction_id}",
                attributes={"role": "participant"}
            ))

        # Lead -> Referrer (if referred)
        if crm_lead.get("referred_by_id"):
            relationships.append(GraphRelationship(
                relationship_type="REFERRED_BY",
                from_entity_id=f"MortgageLead:{lead_id}",
                to_entity_id=f"MortgageLead:{crm_lead['referred_by_id']}",
                attributes={
                    "referralDate": crm_lead.get("referral_date"),
                    "incentive": crm_lead.get("referral_incentive")
                }
            ))

        return relationships

    async def extract_application_relationships(self, crm_app: Dict[str, Any]) -> List[GraphRelationship]:
        """Extract relationships from CRM application data"""

        relationships = []
        app_id = crm_app["id"]

        # Application -> Borrower
        if crm_app.get("borrower_id"):
            relationships.append(GraphRelationship(
                relationship_type="APPLIED_FOR",
                from_entity_id=f"MortgageLead:{crm_app['borrower_id']}",
                to_entity_id=f"LoanApplication:{app_id}",
                attributes={
                    "applicationDate": crm_app.get("application_date"),
                    "status": crm_app.get("stage")
                }
            ))

        # Application -> Property
        if crm_app.get("property_address"):
            property_id = self._generate_property_id(crm_app["property_address"])
            relationships.append(GraphRelationship(
                relationship_type="FOR_PROPERTY",
                from_entity_id=f"LoanApplication:{app_id}",
                to_entity_id=f"Property:{property_id}",
                attributes={
                    "purpose": crm_app.get("loan_purpose")
                }
            ))

        # Application -> Team Members
        for role in ["loan_officer", "processor", "underwriter"]:
            if crm_app.get(f"{role}_id"):
                relationships.append(GraphRelationship(
                    relationship_type="ASSIGNED_TO",
                    from_entity_id=f"LoanApplication:{app_id}",
                    to_entity_id=f"LoanOfficer:{crm_app[f'{role}_id']}",
                    attributes={
                        "role": role,
                        "assignedDate": crm_app.get(f"{role}_assigned_date")
                    }
                ))

        # Application -> Previous Application (if refinance)
        if crm_app.get("loan_purpose") == "Refinance" and crm_app.get("previous_loan_id"):
            relationships.append(GraphRelationship(
                relationship_type="REFINANCES",
                from_entity_id=f"LoanApplication:{app_id}",
                to_entity_id=f"LoanApplication:{crm_app['previous_loan_id']}",
                attributes={
                    "reason": crm_app.get("refinance_reason")
                }
            ))

        return relationships

    def _get_verification_level(self, crm_lead: Dict[str, Any]) -> str:
        """Determine verification level of lead"""
        if crm_lead.get("verified_identity"):
            return "verified"
        elif crm_lead.get("email_verified") or crm_lead.get("phone_verified"):
            return "partial"
        return "unverified"

    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis (placeholder for ML model)"""
        # TODO: Integrate with sentiment analysis service
        positive_words = ["great", "excellent", "happy", "pleased", "satisfied"]
        negative_words = ["bad", "poor", "unhappy", "frustrated", "disappointed"]

        text_lower = text.lower()
        positive_count = sum(word in text_lower for word in positive_words)
        negative_count = sum(word in text_lower for word in negative_words)

        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        return "neutral"

    def _check_compliance(self, crm_app: Dict[str, Any]) -> str:
        """Check compliance status of application"""
        required_fields = ["trilogy_sent", "disclosures_signed", "appraisal_ordered"]
        complete = all(crm_app.get(field) for field in required_fields)
        return "compliant" if complete else "pending"

    def _generate_property_id(self, address: str) -> str:
        """Generate stable property ID from address"""
        import hashlib
        return hashlib.md5(address.lower().encode()).hexdigest()[:16]

graph_mapper = GraphMapper()
```

## API Endpoints

### Webhook Endpoints (api/webhooks.py)

```python
from fastapi import APIRouter, Request, Header, HTTPException
from typing import Optional

from app.services.webhook_processor import webhook_processor
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/twenty")
async def receive_twenty_webhook(
    request: Request,
    x_twenty_signature: Optional[str] = Header(None),
    x_twenty_timestamp: Optional[str] = Header(None)
):
    """Receive webhook from TwentyCRM"""

    # Get raw body for signature verification
    body = await request.body()

    # Verify signature
    if not x_twenty_signature or not x_twenty_timestamp:
        raise HTTPException(status_code=401, detail="Missing signature headers")

    if not webhook_processor.verify_signature(body, x_twenty_signature, x_twenty_timestamp):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse JSON payload
    payload = await request.json()
    event_type = payload.get("event")

    if not event_type:
        raise HTTPException(status_code=400, detail="Missing event type")

    # Process webhook
    result = await webhook_processor.process_webhook(
        event_type=event_type,
        payload=payload,
        signature=x_twenty_signature,
        timestamp=x_twenty_timestamp
    )

    return result
```

## Deployment Configuration

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app /app/app

# Create non-root user
RUN useradd -m -u 1000 bridge && chown -R bridge:bridge /app
USER bridge

EXPOSE 8020

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8020", "--workers", "4"]
```

### Docker Compose Addition

```yaml
# Add to docker-compose.services.yml

  twenty_bridge:
    build:
      context: ./services/twenty-bridge
      dockerfile: Dockerfile
    container_name: nyra-twenty-bridge
    ports:
      - "8020:8020"
    environment:
      - TWENTY_BASE_URL=http://twenty:3000
      - TWENTY_API_KEY=${TWENTY_API_KEY}
      - TWENTY_WEBHOOK_SECRET=${TWENTY_WEBHOOK_SECRET}
      - GRAPHITI_BASE_URL=http://graphiti_mcp:8000
      - GRAPHITI_GROUP_ID=nyra
      - DB_HOST=twenty_bridge_postgres
      - DB_PASSWORD=${BRIDGE_DB_PASSWORD}
      - JWT_SECRET=${BRIDGE_JWT_SECRET}
      - WEBHOOK_SECRET=${BRIDGE_WEBHOOK_SECRET}
      - REDIS_HOST=falkordb
    depends_on:
      - twenty
      - graphiti_mcp
      - twenty_bridge_postgres
    networks:
      - nyra
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8020/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  twenty_bridge_postgres:
    image: postgres:16
    container_name: nyra-twenty-bridge-postgres
    environment:
      - POSTGRES_USER=bridge_user
      - POSTGRES_PASSWORD=${BRIDGE_DB_PASSWORD}
      - POSTGRES_DB=twenty_bridge
    volumes:
      - twenty_bridge_pg:/var/lib/postgresql/data
      - ./services/twenty-bridge/app/database/migrations:/docker-entrypoint-initdb.d:ro
    networks:
      - nyra

volumes:
  twenty_bridge_pg: {}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-04
**Status**: Implementation Ready
