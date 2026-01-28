# Quote API - FastAPI Mortgage Quote Management Service

## 🎯 SERVICE CONTEXT

**Purpose**: Python FastAPI service for mortgage quote management, retrieval, caching, and integration with Quote Engine for rate calculations. Acts as API gateway between frontend and Quote Engine service.

**Port**: 8000
**Language**: Python 3.11 + FastAPI
**Dependencies**: fastapi, sqlalchemy, redis, httpx, pydantic
**Template**: Python/FastAPI backend service (mesh topology for quote retrieval/caching)

## 🚨 CRITICAL DEVELOPMENT RULES

### Async/Await Pattern (MANDATORY)
All I/O operations MUST be async:
```python
# ✅ CORRECT
async def get_quote(quote_id: int):
    quote = await db.get(Quote, quote_id)  # async
    return quote

# ❌ WRONG
def get_quote(quote_id: int):
    quote = db.get(Quote, quote_id)  # sync!
```

### Error Handling Pattern
```python
from fastapi import HTTPException
from app.core.exceptions import QuoteNotFound, InvalidRequest

@router.post("/quotes", status_code=201)
async def create_quote(req: QuoteRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Validate input
        if req.loan_amount > req.property_value:
            raise InvalidRequest("Loan amount exceeds property value")

        # Execute with exception handling
        quote = await quote_service.create(db, req)
        return QuoteResponse.from_orm(quote)
    except InvalidRequest as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Quote creation failed: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
```

## 🏗️ PROJECT STRUCTURE

```
app/
├── api/
│   ├── __init__.py
│   ├── quotes.py         # Quote CRUD endpoints
│   ├── rates.py          # Rate retrieval endpoints
│   └── health.py         # Health check
├── schemas/
│   ├── quote.py          # Pydantic request/response models
│   └── error.py          # Error response schemas
├── services/
│   ├── quote_service.py  # Quote business logic
│   └── cache_service.py  # Redis caching
├── models/
│   ├── database.py       # SQLAlchemy models
│   └── enums.py          # Loan type enums
├── core/
│   ├── config.py         # Settings (environment variables)
│   ├── dependencies.py   # FastAPI dependencies (get_db, auth)
│   ├── exceptions.py     # Custom exceptions
│   └── logging.py        # Structured logging
├── db/
│   ├── session.py        # Database session factory
│   └── migrations/       # Alembic migrations
└── main.py               # FastAPI app entry
```

## 🔧 FASTAPI PATTERNS

### Dependency Injection (Database)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# Usage
@router.get("/quotes/{quote_id}")
async def get_quote(
    quote_id: int,
    db: AsyncSession = Depends(get_db)
):
    quote = await db.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return QuoteResponse.from_orm(quote)
```

### Pydantic V2 Models
```python
from pydantic import BaseModel, Field, field_validator

class QuoteRequest(BaseModel):
    loan_amount: float = Field(gt=0, description="Loan amount in USD")
    property_value: float = Field(gt=0)
    credit_score: int = Field(ge=300, le=850)
    loan_type: str = Field(pattern="^(conventional|fha|va|jumbo)$")

    @field_validator('loan_amount')
    @classmethod
    def validate_ltv(cls, v, info):
        if info.data.get('property_value') and v > info.data['property_value']:
            raise ValueError("Loan amount exceeds property value")
        return v

class QuoteResponse(BaseModel):
    id: int
    loan_amount: float
    interest_rate: float
    apr: float
    monthly_payment: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### Response Caching with Redis
```python
from app.services.cache_service import get_cached, set_cached

@router.get("/quotes/{quote_id}")
async def get_quote(quote_id: int, db: AsyncSession = Depends(get_db)):
    # Check cache first
    cached = await get_cached(f"quote:{quote_id}")
    if cached:
        return json.loads(cached)

    # Query database
    quote = await db.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404)

    # Cache for 15 minutes
    response = QuoteResponse.from_orm(quote)
    await set_cached(f"quote:{quote_id}", response.model_dump_json(), ttl=900)
    return response
```

### Background Task Integration (Quote Processing)
```python
@router.post("/quotes", status_code=202)
async def create_quote(
    request: QuoteRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Create quote record with pending status
    quote = Quote(status="pending", **request.dict())
    db.add(quote)
    await db.commit()

    # Queue calculation task
    background_tasks.add_task(
        calculate_quote_rates,
        quote_id=quote.id
    )

    return {"quote_id": quote.id, "status": "processing"}
```

## 📊 QUOTE API ENDPOINTS

### Core Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/quotes` | Create new quote |
| GET | `/quotes/{id}` | Retrieve quote details |
| GET | `/quotes` | List borrower's quotes |
| PUT | `/quotes/{id}` | Update quote (rare) |
| DELETE | `/quotes/{id}` | Soft delete quote |
| GET | `/quotes/{id}/rates` | Get rate scenarios |
| GET | `/health` | Service health check |

## 🧪 PYTEST TESTING

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_quote(client, db_session):
    # Arrange: Valid quote request
    payload = {
        "loan_amount": 300000,
        "property_value": 400000,
        "credit_score": 750,
        "loan_type": "conventional"
    }

    # Act: Create quote
    response = await client.post("/quotes", json=payload)

    # Assert
    assert response.status_code == 201
    assert response.json()["id"] > 0
    assert response.json()["status"] == "pending"

@pytest.mark.asyncio
async def test_quote_not_found(client):
    response = await client.get("/quotes/999")
    assert response.status_code == 404
```

## 📈 PERFORMANCE TARGETS

- Quote retrieval (cached): <10ms p95
- Quote creation: <500ms (with Quote Engine call)
- List quotes: <100ms (for 10+ quotes)
- Cache hit rate: >80%

## 🔒 SECURITY

- Validate all inputs (Pydantic)
- Implement rate limiting
- Use HTTPS in production
- Log all quote accesses
- Encrypt sensitive borrower data

---

**This service provides fast, reliable access to mortgage quotes with caching and compliance-first design.**
