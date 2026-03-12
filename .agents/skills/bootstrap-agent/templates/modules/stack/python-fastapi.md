# 🐍 Python + FastAPI Stack Module

## Tech Stack
- **Framework**: FastAPI 0.110+
- **Language**: Python 3.11+
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Validation**: Pydantic V2
- **Testing**: Pytest + Pytest-asyncio
- **API Docs**: Auto-generated OpenAPI

## Project Structure
```
{{appName}}/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Settings (Pydantic BaseSettings)
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   ├── dependencies.py      # Dependency injection
│   └── exceptions.py        # Custom exceptions
├── migrations/              # Alembic migrations
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── test_api/            # API tests
│   └── test_services/       # Service tests
├── requirements/
│   ├── base.txt             # Base dependencies
│   ├── dev.txt              # Dev dependencies
│   └── prod.txt             # Production dependencies
└── pyproject.toml           # Project metadata
```

## Development Commands
```bash
# Development
{{devCommand}}

# Install dependencies
pip install -r requirements/dev.txt

# Run with hot reload
uvicorn app.main:app --reload --port {{port}}

# Test
{{testCommand}}

# Lint
ruff check .
mypy app/

# Format
ruff format .
```

## Code Conventions

### Application Setup
```python
# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, items
from app.config import settings

app = FastAPI(
    title="{{appName}}",
    version="{{version}}",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(items.router, prefix="/api/v1/items", tags=["items"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "{{version}}"}
```

### Router Pattern
```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, services
from app.dependencies import get_db

router = APIRouter()

@router.get("/", response_model=list[schemas.UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all users with pagination"""
    return services.user_service.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user = services.user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Create new user"""
    return services.user_service.create_user(db, user)
```

### Service Layer
```python
# app/services/user_service.py
from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException, status

class UserService:
    def get_user(self, db: Session, user_id: int) -> models.User | None:
        return db.query(models.User).filter(models.User.id == user_id).first()

    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> list[models.User]:
        return db.query(models.User).offset(skip).limit(limit).all()

    def create_user(self, db: Session, user: schemas.UserCreate) -> models.User:
        # Check if user exists
        existing = db.query(models.User).filter(
            models.User.email == user.email
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        db_user = models.User(**user.model_dump())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

user_service = UserService()
```

### Models (SQLAlchemy)
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Schemas (Pydantic)
```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: str | None = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    APP_NAME: str = "{{appName}}"
    VERSION: str = "{{version}}"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
```

### Exception Handling
```python
# app/exceptions.py
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

class APIException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Register in main.py:
# app.add_exception_handler(APIException, api_exception_handler)
```

### Testing Strategy
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base
from app.dependencies import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

# tests/test_api/test_users.py
def test_create_user(client):
    response = client.post(
        "/api/v1/users/",
        json={"email": "test@example.com", "name": "Test User"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
```

### Best Practices
- Use dependency injection for database sessions
- Type hints everywhere (mypy strict mode)
- Pydantic models for validation
- Separate schemas for create/update/response
- Service layer for business logic
- Repository pattern for data access
- Async where beneficial (I/O bound operations)
- Use background tasks for non-blocking operations

### Database Migrations
```bash
# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Add users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Security
- Use OAuth2 with JWT tokens
- Password hashing with passlib (bcrypt)
- Rate limiting with slowapi
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration

### Performance
- Use async/await for I/O operations
- Database connection pooling
- Response caching with Redis
- Background tasks for long operations
- Pagination for large datasets
- Database query optimization

---
