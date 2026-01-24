# CLAUDE.md Template: Python Development

**Language**: Python {{PYTHON_VERSION}}
**Framework**: {{FRAMEWORK}} (Django/Flask/FastAPI)
**Package Manager**: pip/Poetry
**Type Checking**: {{TYPE_CHECKING}} (mypy/Pyright)

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Python Version**: {{PYTHON_VERSION}} (3.9+)
- **Framework**: {{FRAMEWORK}}
- **Database**: {{DATABASE}}
- **Virtual Environment**: venv/Poetry

## 🔧 Python Project Structure

```
project/
├── src/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── logging.py
│   └── cli/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── migrations/
├── requirements.txt
├── pyproject.toml
├── setup.py
├── Dockerfile
└── README.md
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "python-patterns-{{PROJECT_NAME}}" \
  --value "Async patterns, virtual env setup, type hints usage" \
  --namespace python --tags "patterns"
```

## 🚀 Development Workflow

### Virtual Environment Setup
```bash
# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate
# or Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create requirements file
pip freeze > requirements.txt
```

### FastAPI Server Example
```python
# src/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import users, products
from app.config.settings import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up")
    yield
    # Shutdown
    print("Shutting down")

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(users.router, prefix="/api/users")
app.include_router(products.router, prefix="/api/products")

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### Async Database Pattern
```python
# src/app/services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def get_user_with_orders(session: AsyncSession, user_id: int):
    """Fetch user with their orders using async"""
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.orders))
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()
```

## ✅ Testing Strategy

### pytest Configuration
```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture
async def db_session():
    """Async database session for tests"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = AsyncSession(engine)
    yield async_session
    await async_session.close()
```

### Unit Tests Example
```python
# tests/unit/services/test_user_service.py
@pytest.mark.asyncio
async def test_create_user(db_session):
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "SecurePass123!",
    }

    user = await create_user(db_session, user_data)

    assert user.id is not None
    assert user.email == user_data["email"]
```

## 🎯 Python Performance Targets

- Server startup: <2s
- Average response time: <200ms
- Memory usage: <300MB
- Database queries: <100ms

## 📋 Python Checklist

- [ ] Python version configured
- [ ] Virtual environment set up
- [ ] Dependencies managed
- [ ] Database models created
- [ ] API routes implemented
- [ ] Error handling configured
- [ ] Type hints added
- [ ] Tests configured
- [ ] Linting (pylint/flake8) set up
- [ ] Code formatting (black) configured
- [ ] Async patterns implemented
- [ ] Deployment configured

---

**Generated from**: claude-flow CLAUDE.md Python Development Template
