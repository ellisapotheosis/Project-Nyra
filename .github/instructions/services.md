---
description: Backend microservices development standards
applyTo:
  - "services/**/*.{ts,js,py}"
  - "packages/database/**/*"
stack: Node.js 20+, Python 3.11+, Express.js, FastAPI, Prisma, PostgreSQL
---

# Backend Microservices - Development Instructions

## Scope

This file applies to all backend microservices in the `services/` directory:
- Node.js services (Express.js, Fastify)
- Python services (FastAPI)
- Shared database package (`packages/database/`)

## Tech Stack

### Node.js Services
- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.7+
- **Frameworks:** Express.js, Fastify
- **ORM:** Prisma
- **Validation:** Zod
- **Testing:** Jest, Supertest

### Python Services
- **Runtime:** Python 3.11+
- **Framework:** FastAPI 0.109+
- **Validation:** Pydantic v2
- **ORM:** SQLAlchemy (if needed)
- **Testing:** pytest

### Databases
- **Primary DB:** PostgreSQL 16
- **Cache:** Redis 7
- **Message Queue:** RabbitMQ
- **Vector DB:** Qdrant

## Project Structure (Node.js Service)

```
services/[service-name]/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # App configuration
│   ├── routes/               # API routes
│   │   ├── index.ts         # Route aggregator
│   │   └── users.routes.ts  # Feature routes
│   ├── controllers/          # Request handlers
│   │   └── users.controller.ts
│   ├── services/             # Business logic
│   │   └── users.service.ts
│   ├── models/               # Data models
│   │   └── user.model.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/                # Utilities
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── types/                # TypeScript types
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── prisma/                   # Database schema (if service-specific)
├── package.json
└── tsconfig.json
```

## Project Structure (Python Service)

```
services/[service-name]/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   └── quotes.py
│   ├── schemas/             # Pydantic models
│   │   ├── __init__.py
│   │   └── quote.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── quote_service.py
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   └── quote.py
│   ├── core/                # Core config
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── logging.py
│   └── utils/
│       ├── __init__.py
│       └── validators.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_quotes.py
├── requirements.txt
└── pyproject.toml
```

## API Patterns

### Express.js REST API

```typescript
// routes/users.routes.ts
import { Router } from 'express';
import { createUser, getUser, updateUser } from '../controllers/users.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.post('/users',
  validateRequest(createUserSchema),
  createUser
);

router.get('/users/:id', getUser);

router.patch('/users/:id',
  validateRequest(updateUserSchema),
  updateUser
);

export default router;
```

```typescript
// controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/users.service';
import { AppError } from '../utils/errors';

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await UserService.create(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await UserService.findById(req.params.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}
```

```typescript
// services/users.service.ts
import { prisma } from '../lib/db';
import { CreateUserInput, User } from '../types';
import { AppError } from '../utils/errors';

export class UserService {
  static async create(input: CreateUserInput): Promise<User> {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    
    if (existing) {
      throw new AppError('User already exists', 409);
    }
    
    // Create user
    return prisma.user.create({
      data: input,
    });
  }
  
  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
```

### FastAPI REST API

```python
# routers/quotes.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from ..schemas.quote import QuoteCreate, QuoteResponse
from ..services.quote_service import QuoteService

router = APIRouter(prefix="/api/v1/quotes", tags=["quotes"])

@router.post(
    "/",
    response_model=QuoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a mortgage quote"
)
async def create_quote(
    quote: QuoteCreate,
    service: QuoteService = Depends()
) -> QuoteResponse:
    """
    Create a new mortgage quote with the provided parameters.
    
    Args:
        quote: Quote creation data
        
    Returns:
        Created quote with calculated monthly payment
        
    Raises:
        HTTPException: If calculation fails
    """
    try:
        result = await service.calculate_quote(quote)
        return QuoteResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get(
    "/{quote_id}",
    response_model=QuoteResponse,
    summary="Get quote by ID"
)
async def get_quote(
    quote_id: str,
    service: QuoteService = Depends()
) -> QuoteResponse:
    """Retrieve a quote by its ID."""
    quote = await service.get_by_id(quote_id)
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote {quote_id} not found"
        )
    
    return QuoteResponse(**quote)
```

```python
# schemas/quote.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class QuoteCreate(BaseModel):
    """Quote creation request schema."""
    loan_amount: float = Field(..., gt=0, description="Loan amount in dollars")
    interest_rate: float = Field(..., gt=0, le=100, description="Annual interest rate")
    term_years: int = Field(..., gt=0, le=40, description="Loan term in years")
    
    @field_validator('loan_amount')
    @classmethod
    def validate_loan_amount(cls, v: float) -> float:
        if v > 10_000_000:
            raise ValueError('Loan amount exceeds maximum of $10,000,000')
        return v

class QuoteResponse(BaseModel):
    """Quote response schema."""
    id: str
    loan_amount: float
    interest_rate: float
    term_years: int
    monthly_payment: float
    total_payment: float
    total_interest: float
    created_at: datetime
    
    class Config:
        from_attributes = True  # For Pydantic v2
```

```python
# services/quote_service.py
from typing import Dict, Optional
import uuid
from datetime import datetime
from ..schemas.quote import QuoteCreate

class QuoteService:
    """Business logic for mortgage quotes."""
    
    async def calculate_quote(self, quote: QuoteCreate) -> Dict:
        """
        Calculate mortgage quote with monthly payment.
        
        Args:
            quote: Quote parameters
            
        Returns:
            Dict with calculated values
        """
        # Calculate monthly payment
        monthly_rate = quote.interest_rate / 100 / 12
        num_payments = quote.term_years * 12
        
        if monthly_rate == 0:
            monthly_payment = quote.loan_amount / num_payments
        else:
            monthly_payment = (
                quote.loan_amount * 
                (monthly_rate * (1 + monthly_rate) ** num_payments) /
                ((1 + monthly_rate) ** num_payments - 1)
            )
        
        total_payment = monthly_payment * num_payments
        total_interest = total_payment - quote.loan_amount
        
        return {
            "id": str(uuid.uuid4()),
            "loan_amount": quote.loan_amount,
            "interest_rate": quote.interest_rate,
            "term_years": quote.term_years,
            "monthly_payment": round(monthly_payment, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "created_at": datetime.utcnow()
        }
    
    async def get_by_id(self, quote_id: str) -> Optional[Dict]:
        """Retrieve quote by ID (placeholder - implement with real DB)."""
        # TODO: Implement database query
        return None
```

## Database with Prisma

### Schema Definition
```prisma
// packages/database/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  quotes    Quote[]
  
  @@index([email])
  @@map("users")
}

model Quote {
  id             String   @id @default(cuid())
  userId         String
  loanAmount     Float    @map("loan_amount")
  interestRate   Float    @map("interest_rate")
  termYears      Int      @map("term_years")
  monthlyPayment Float    @map("monthly_payment")
  createdAt      DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("quotes")
}

enum Role {
  USER
  ADMIN
  LOAN_OFFICER
}
```

### Prisma Client Usage
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
```

### Transactions
```typescript
import { prisma } from '../lib/db';

async function createUserWithQuote(userData, quoteData) {
  return prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: userData,
    });
    
    // Create quote
    const quote = await tx.quote.create({
      data: {
        ...quoteData,
        userId: user.id,
      },
    });
    
    return { user, quote };
  });
}
```

## Error Handling

### Custom Error Class (Node.js)
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

### Error Middleware (Express.js)
```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }
  
  // Handle custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
  });
}
```

## Authentication & Authorization

### JWT Middleware
```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

interface JWTPayload {
  userId: string;
  role: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;
    
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    next();
  };
}
```

## Logging

### Winston Logger (Node.js)
```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export { logger };
```

### Python Logging
```python
# core/logging.py
import logging
import sys
from pathlib import Path

def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configure application logging."""
    
    # Create logs directory
    Path("logs").mkdir(exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("logs/app.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)

logger = setup_logging()
```

## Testing

### Unit Test (Jest)
```typescript
// tests/unit/services/users.service.test.ts
import { UserService } from '../../../src/services/users.service';
import { prisma } from '../../../src/lib/db';
import { AppError } from '../../../src/utils/errors';

jest.mock('../../../src/lib/db', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      
      const result = await UserService.create({
        email: 'test@example.com',
        name: 'Test User',
      });
      
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });
    
    it('should throw error if user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      });
      
      await expect(
        UserService.create({
          email: 'test@example.com',
          name: 'Test User',
        })
      ).rejects.toThrow(AppError);
    });
  });
});
```

### Integration Test (Supertest)
```typescript
// tests/integration/users.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/db';

describe('Users API', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  
  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });
  
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
        })
        .expect(201);
      
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('test@example.com');
    });
    
    it('should return 400 for invalid email', async () => {
      await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          name: 'Test User',
        })
        .expect(400);
    });
  });
});
```

### Python Test (pytest)
```python
# tests/test_quotes.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_quote():
    """Test quote creation."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/quotes/",
            json={
                "loan_amount": 300000,
                "interest_rate": 3.5,
                "term_years": 30
            }
        )
    
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["monthly_payment"] > 0

@pytest.mark.asyncio
async def test_create_quote_invalid_amount():
    """Test quote creation with invalid loan amount."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/quotes/",
            json={
                "loan_amount": -100,
                "interest_rate": 3.5,
                "term_years": 30
            }
        )
    
    assert response.status_code == 422  # Validation error
```

## Development Commands

```bash
# Node.js service
pnpm --filter @nyra/[service-name] dev        # Development mode
pnpm --filter @nyra/[service-name] build      # Build
pnpm --filter @nyra/[service-name] test       # Run tests
pnpm --filter @nyra/[service-name] test:watch # Watch mode

# Python service
cd services/[service-name]
python -m uvicorn app.main:app --reload       # Development mode
python -m pytest tests/ -v                    # Run tests
python -m pytest tests/ -v --cov=app         # With coverage

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

## Key Reminders

1. **Always validate inputs** with Zod (Node.js) or Pydantic (Python)
2. **Use Prisma for database** operations (avoid raw SQL)
3. **Implement proper error handling** with custom error classes
4. **Add logging** for debugging and monitoring
5. **Write tests** for all business logic
6. **Use transactions** for multi-step operations
7. **Implement authentication** for protected endpoints
8. **Never log sensitive data** (passwords, tokens, API keys)
9. **Use environment variables** for configuration
10. **Document API endpoints** with JSDoc or Python docstrings

---

**Last Updated:** 2026-01-18
