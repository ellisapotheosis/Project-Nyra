## Python + FastAPI Development Guidelines

### Project Structure
```
app/
├── api/            # API routes and endpoints
├── core/           # Core configuration
├── models/         # Pydantic models
├── schemas/        # Request/response schemas
├── services/       # Business logic
├── db/             # Database models and migrations
└── main.py         # FastAPI application entry
```

### API Endpoint Pattern
```python
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import QuoteRequest, QuoteResponse
from app.services import calculate_quote

router = APIRouter()

@router.post("/quotes", response_model=QuoteResponse)
async def create_quote(
    request: QuoteRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        result = await calculate_quote(request)
        return QuoteResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Pydantic Models
- Use Pydantic V2 syntax
- Define field validators
- Use computed fields when needed
- Leverage Field() for metadata

### Database
- SQLAlchemy 2.0 async syntax
- Alembic for migrations
- Use async database drivers
- Implement proper connection pooling

### Dependency Injection
```python
async def get_db():
    async with async_session() as session:
        yield session

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await db.get(User, user_id)
```

### Error Handling
- Custom exception handlers
- Proper HTTP status codes
- Structured error responses
- Log errors with context

### Background Tasks
```python
from fastapi import BackgroundTasks

@router.post("/process")
async def process_data(
    data: Data,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(heavy_processing, data)
    return {"message": "Processing started"}
```

### Testing
- pytest with pytest-asyncio
- Test fixtures for database
- httpx for API testing
- Mock external services

### Performance
- Use async/await consistently
- Redis for caching
- Celery for heavy background tasks
- Database query optimization

### Best Practices
- Type hints on all functions
- Docstrings for public APIs
- Use async patterns consistently
- Proper logging (structlog recommended)
- Environment-based configuration
