# Project Nyra Templates & Demos Catalog

**Comprehensive Template Library for Rapid Development**

This catalog provides production-ready templates, demos, and examples for all Project Nyra components including CLAUDE.md configurations, agent setups, SPARC workflows, integration patterns, and n8n campaign templates.

---

## 📋 Table of Contents

1. [CLAUDE.md Templates](#claudemd-templates)
2. [Agent Configuration Templates](#agent-configuration-templates)
3. [SPARC Workflow Demos](#sparc-workflow-demos)
4. [Integration Pattern Examples](#integration-pattern-examples)
5. [n8n Campaign Templates](#n8n-campaign-templates)
6. [Docker Compose Templates](#docker-compose-templates)
7. [API Client Examples](#api-client-examples)
8. [Testing Templates](#testing-templates)

---

## 📄 CLAUDE.md Templates

### Template 1: Python FastAPI Service

**Use Case**: Backend microservices (Quote Engine, Campaign Engine, Nyra Orchestrator)

```markdown
# [Service Name] - CLAUDE.md

## 🎯 SERVICE CONTEXT

**Purpose**: [One-line description of what this service does]

**Technology Stack**:
- Language: Python 3.11+
- Framework: FastAPI 0.109+
- Database: PostgreSQL 15 + SQLAlchemy ORM
- Cache: Redis 7.2
- Testing: pytest + pytest-asyncio

**Performance Targets**:
- Response Time: < [X]ms (p95)
- Throughput: [Y] requests/second
- Error Rate: < 1%

---

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Execution Pattern
**MANDATORY**: Batch all I/O operations in single async calls:

```python
# ✅ CORRECT: Parallel execution
async def process_lead(lead_data):
    credit_check, employment_verify, asset_verify = await asyncio.gather(
        check_credit(lead_data["ssn"]),
        verify_employment(lead_data["employer"]),
        verify_assets(lead_data["bank_accounts"])
    )
    return combine_results(credit_check, employment_verify, asset_verify)

# ❌ WRONG: Sequential execution
async def process_lead_slow(lead_data):
    credit_check = await check_credit(lead_data["ssn"])  # Wait
    employment_verify = await verify_employment(lead_data["employer"])  # Wait
    asset_verify = await verify_assets(lead_data["bank_accounts"])  # Wait
    return combine_results(credit_check, employment_verify, asset_verify)
```

### Compliance-First Development
**CRITICAL**: Every mortgage operation MUST include compliance validation:

```python
from nyra_compliance import validate_tila, validate_respa, validate_ecoa

@router.post("/quotes/generate")
async def generate_quote(quote_request: QuoteRequest):
    # Generate quote
    quote = await quote_engine.calculate(quote_request)

    # MANDATORY: Validate compliance
    tila_valid = validate_tila(quote)
    respa_valid = validate_respa(quote)
    ecoa_valid = validate_ecoa(quote, quote_request)

    if not all([tila_valid, respa_valid, ecoa_valid]):
        raise ComplianceViolationError("Quote failed compliance checks")

    return quote
```

---

## 📊 API ENDPOINTS

### Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "healthy"
  }
}
```

### [Primary Endpoint]
```http
POST /api/[resource]/[action]
```

**Request**:
```json
{
  "field1": "value1",
  "field2": 123
}
```

**Response**:
```json
{
  "result": "success",
  "data": {}
}
```

---

## 🔧 DEVELOPMENT WORKFLOW

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_quotes.py -v

# Run with compliance validation
pytest --compliance-checks
```

---

## 🐳 DOCKER DEPLOYMENT

```yaml
services:
  [service-name]:
    build:
      context: .
      dockerfile: Dockerfile
    image: ghcr.io/project-nyra/[service-name]:latest
    container_name: [service-name]
    restart: unless-stopped
    ports:
      - "[external-port]:[internal-port]"
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
      - LOG_LEVEL=INFO
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:[internal-port]/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Query Optimization
```python
# ✅ GOOD: Eager loading to prevent N+1
leads = await db.execute(
    select(Lead).options(
        selectinload(Lead.borrower),
        selectinload(Lead.loan_details)
    )
)

# ❌ BAD: Lazy loading causes N+1 queries
leads = await db.execute(select(Lead))
for lead in leads:
    borrower = lead.borrower  # Additional query per lead
```

### Caching Strategy
```python
from functools import lru_cache
import redis

redis_client = redis.Redis(host='redis', port=6379)

@lru_cache(maxsize=1000)
def get_rate_table(date: str) -> Dict:
    """Cache rate tables for 1 hour."""
    cache_key = f"rate_table:{date}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    rate_table = fetch_from_optimal_blue(date)
    redis_client.setex(cache_key, 3600, json.dumps(rate_table))
    return rate_table
```

---

## 🔒 SECURITY REQUIREMENTS

### Input Validation
```python
from pydantic import BaseModel, Field, EmailStr

class LeadCreateRequest(BaseModel):
    email: EmailStr  # Validates email format
    phone: str = Field(..., regex=r'^\d{10}$')  # 10-digit phone
    ssn: str = Field(..., regex=r'^\d{9}$')  # 9-digit SSN
    annual_income: int = Field(..., gt=0, lt=10000000)  # Positive, reasonable

    @validator('ssn')
    def encrypt_ssn(cls, v):
        return encrypt_pii(v)  # Always encrypt SSN
```

### PII Encryption
```python
from cryptography.fernet import Fernet

def encrypt_pii(plaintext: str) -> str:
    """Encrypt sensitive PII data."""
    cipher = Fernet(settings.ENCRYPTION_KEY)
    return cipher.encrypt(plaintext.encode()).decode()

def decrypt_pii(ciphertext: str) -> str:
    """Decrypt sensitive PII data."""
    cipher = Fernet(settings.ENCRYPTION_KEY)
    return cipher.decrypt(ciphertext.encode()).decode()
```

---

## 📚 RELATED DOCUMENTATION

- [API Documentation](./API-DOCS.md)
- [Database Schema](./DATABASE-SCHEMA.md)
- [Deployment Guide](../CONTAINERIZATION-GUIDE.md)
- [Best Practices](../BEST-PRACTICES-GUIDE.md)
```

---

### Template 2: TypeScript React Next.js Application

**Use Case**: Frontend applications (RateHunter, Nyra Admin)

```markdown
# [App Name] - CLAUDE.md

## 🎯 APPLICATION CONTEXT

**Purpose**: [One-line description]

**Technology Stack**:
- Framework: Next.js 14 (App Router)
- Language: TypeScript 5.3
- Styling: Tailwind CSS 3.4
- State Management: Zustand / React Context
- Forms: React Hook Form + Zod validation
- API Client: Axios with interceptors

**Performance Targets**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

---

## 🚨 CRITICAL DEVELOPMENT RULES

### Type Safety
**MANDATORY**: All components must be fully typed:

```typescript
// ✅ CORRECT: Full type safety
interface QuoteCardProps {
  quote: Quote;
  onAccept: (quoteId: string) => Promise<void>;
  onReject: (quoteId: string, reason: string) => Promise<void>;
}

export function QuoteCard({ quote, onAccept, onReject }: QuoteCardProps) {
  // Component implementation
}

// ❌ WRONG: Any types or missing types
export function QuoteCard({ quote, onAccept }: any) {
  // Type safety lost
}
```

### Server Components First
**PREFER**: Use React Server Components for data fetching:

```typescript
// ✅ GOOD: Server Component (default in Next.js 14)
import { getLeads } from '@/lib/api/leads';

export default async function LeadsPage() {
  const leads = await getLeads();  // Server-side fetch

  return (
    <div>
      <h1>Leads</h1>
      <LeadsList leads={leads} />
    </div>
  );
}

// Use Client Component only when needed
'use client';

export function InteractiveQuoteForm() {
  const [amount, setAmount] = useState(0);
  // Interactive form logic
}
```

---

## 📁 PROJECT STRUCTURE

```
apps/[app-name]/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Auth routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── leads/
│   │   ├── quotes/
│   │   └── campaigns/
│   ├── api/                 # API routes
│   │   └── webhooks/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   └── layouts/             # Layout components
├── lib/                     # Utility libraries
│   ├── api/                 # API clients
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── styles/                  # Global styles
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🎨 COMPONENT EXAMPLES

### Page Component (Server Component)
```typescript
// app/leads/page.tsx
import { getLeads } from '@/lib/api/leads';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { PageHeader } from '@/components/layouts/PageHeader';

export const metadata = {
  title: 'Leads | Nyra Admin',
  description: 'Manage mortgage leads'
};

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Leads"
        subtitle="Manage and qualify mortgage leads"
        action={{
          label: 'Add Lead',
          href: '/leads/new'
        }}
      />
      <LeadsTable leads={leads} />
    </div>
  );
}
```

### Interactive Component (Client Component)
```typescript
// components/forms/QuoteRequestForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quoteSchema = z.object({
  propertyValue: z.number().min(50000).max(10000000),
  downPayment: z.number().min(0),
  creditScore: z.number().min(580).max(850)
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export function QuoteRequestForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema)
  });

  const onSubmit = async (data: QuoteFormData) => {
    const response = await fetch('/api/quotes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const quote = await response.json();
    // Handle quote response
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Property Value"
        type="number"
        {...register('propertyValue', { valueAsNumber: true })}
        error={errors.propertyValue?.message}
      />
      <Input
        label="Down Payment"
        type="number"
        {...register('downPayment', { valueAsNumber: true })}
        error={errors.downPayment?.message}
      />
      <Input
        label="Credit Score"
        type="number"
        {...register('creditScore', { valueAsNumber: true })}
        error={errors.creditScore?.message}
      />
      <Button type="submit">Get Quote</Button>
    </form>
  );
}
```

---

## 🔌 API INTEGRATION

### API Client Setup
```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Service Example
```typescript
// lib/api/leads.ts
import apiClient from './client';
import type { Lead, LeadCreateRequest } from '@/lib/types/lead';

export async function getLeads(): Promise<Lead[]> {
  const { data } = await apiClient.get('/api/leads');
  return data;
}

export async function getLead(id: string): Promise<Lead> {
  const { data } = await apiClient.get(`/api/leads/${id}`);
  return data;
}

export async function createLead(leadData: LeadCreateRequest): Promise<Lead> {
  const { data } = await apiClient.post('/api/leads', leadData);
  return data;
}

export async function updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
  const { data} = await apiClient.patch(`/api/leads/${id}`, leadData);
  return data;
}
```

---

## 🧪 TESTING

### Component Testing
```typescript
// __tests__/components/QuoteCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteCard } from '@/components/quotes/QuoteCard';

const mockQuote = {
  id: '123',
  interestRate: 6.5,
  monthlyPayment: 2275,
  loanAmount: 360000
};

describe('QuoteCard', () => {
  it('renders quote details', () => {
    render(<QuoteCard quote={mockQuote} onAccept={jest.fn()} onReject={jest.fn()} />);

    expect(screen.getByText('6.5%')).toBeInTheDocument();
    expect(screen.getByText('$2,275/mo')).toBeInTheDocument();
  });

  it('calls onAccept when accept button clicked', () => {
    const onAccept = jest.fn();
    render(<QuoteCard quote={mockQuote} onAccept={onAccept} onReject={jest.fn()} />);

    fireEvent.click(screen.getByText('Accept Quote'));

    expect(onAccept).toHaveBeenCalledWith('123');
  });
});
```

---

## 📚 RELATED DOCUMENTATION

- [Component Library](./COMPONENT-LIBRARY.md)
- [API Integration](./API-INTEGRATION.md)
- [Deployment Guide](../CONTAINERIZATION-GUIDE.md)
```

---

## 🤖 Agent Configuration Templates

### Template: Research Agent

```yaml
# .claude/agents/research/market-analyst.md
agent_type: researcher
name: "Market Research Analyst"
role: "Deep research and data analysis for mortgage market trends"

capabilities:
  - web_search
  - data_analysis
  - report_generation
  - trend_identification

tools:
  - WebFetch
  - WebSearch
  - Read
  - Write
  - Bash (for data processing)

memory:
  type: episodic
  retention: 30_days
  namespace: "market_research"

workflow:
  1_research:
    description: "Search for recent mortgage market data"
    tools: [WebSearch, WebFetch]
    parallel: true

  2_analyze:
    description: "Analyze trends and patterns"
    tools: [Read, Bash]
    requires: [1_research]

  3_report:
    description: "Generate comprehensive report"
    tools: [Write]
    requires: [2_analyze]

performance_targets:
  research_depth: comprehensive
  source_count: 10+
  completion_time: < 10_minutes

example_usage: |
  # Task agent with researcher
  npx claude-flow task "Research current mortgage rate trends for Q1 2024" \
    --agent market-analyst \
    --output reports/q1-2024-trends.md
```

### Template: Code Implementation Agent

```yaml
# .claude/agents/development/fastapi-backend-engineer.md
agent_type: coder
name: "FastAPI Backend Engineer"
role: "Implement Python FastAPI microservices with TDD"

capabilities:
  - fastapi_development
  - async_python
  - database_orm
  - api_design
  - test_driven_development

tools:
  - Read
  - Write
  - Edit
  - Bash (pytest, black, mypy)

patterns:
  - async_await_patterns
  - dependency_injection
  - repository_pattern
  - service_layer_architecture

compliance_rules:
  - tila_validation
  - respa_compliance
  - ecoa_anti_discrimination
  - tcpa_consent_checking

workflow:
  1_specification:
    description: "Review requirements and API spec"
    tools: [Read]

  2_test_first:
    description: "Write failing tests (TDD)"
    tools: [Write]
    pattern: pytest

  3_implementation:
    description: "Implement feature to pass tests"
    tools: [Write, Edit]
    pattern: fastapi_async

  4_refactor:
    description: "Optimize and clean up code"
    tools: [Edit, Bash]
    commands: [black, mypy, ruff]

  5_compliance:
    description: "Add compliance validation"
    tools: [Edit]
    mandatory: true

performance_targets:
  test_coverage: > 90%
  type_coverage: > 95%
  code_quality: A_grade

example_usage: |
  # SPARC workflow with backend engineer
  npx claude-flow sparc run all \
    "Implement Quote Engine /api/quotes/generate endpoint" \
    --agent fastapi-backend-engineer \
    --tdd \
    --compliance-checks
```

---

## 🎭 SPARC Workflow Demos

### Demo 1: Complete Feature Development

```bash
# Build a complete feature from specification to deployment
npx claude-flow sparc run all \
  "Add mortgage rate lock feature to Quote Engine" \
  --output docs/rate-lock-implementation.md

# Phases executed:
# 1. Specification - Requirements gathering and API design
# 2. Pseudocode - Algorithm design for rate lock logic
# 3. Architecture - System integration and database schema
# 4. Refinement - Test writing and edge case handling
# 5. Completion - Implementation, testing, documentation
```

**Expected Output**:
```
✅ Specification Phase Complete (2 minutes)
   - Requirements documented
   - API endpoints designed
   - Database schema defined

✅ Pseudocode Phase Complete (3 minutes)
   - Rate lock algorithm designed
   - Expiration logic defined
   - Extension policy outlined

✅ Architecture Phase Complete (5 minutes)
   - Integration points identified
   - Database migrations created
   - Service layer designed

✅ Refinement Phase Complete (8 minutes)
   - 15 test cases written
   - Edge cases covered
   - Performance optimized

✅ Completion Phase Complete (12 minutes)
   - Feature fully implemented
   - All tests passing (100% coverage)
   - Documentation generated

Total Time: 30 minutes
Output: docs/rate-lock-implementation.md
```

### Demo 2: Parallel SPARC Batch

```bash
# Build 3 features in parallel using batch mode
npx claude-flow sparc batch specification,architecture,completion \
  "Quote Engine rate calculator, \
   Campaign Engine n8n integration, \
   Nyra Orchestrator compliance validator" \
  --parallel \
  --agents 3

# 3x faster than sequential (10 min vs 30 min)
```

---

## 🔌 Integration Pattern Examples

### Pattern 1: Webhook Handler with Validation

```python
# services/nyra-orchestrator/app/webhooks/freerateupdate.py
from fastapi import APIRouter, HTTPException, Request, Depends
import hmac
import hashlib
from app.compliance import validate_tcpa_consent
from app.services.quote_engine import QuoteEngineClient
from app.services.campaign_engine import CampaignEngineClient
from app.services.twentycrm import TwentyCRMClient

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

async def verify_signature(request: Request) -> bool:
    """Verify webhook signature from FreeRateUpdate.com."""
    signature = request.headers.get("X-FRU-Signature")
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    body = await request.body()
    expected_sig = hmac.new(
        settings.FRU_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_sig):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True

@router.post("/freerateupdate")
async def handle_freerateupdate_webhook(
    request: Request,
    verified: bool = Depends(verify_signature),
    quote_engine: QuoteEngineClient = Depends(),
    campaign_engine: CampaignEngineClient = Depends(),
    crm: TwentyCRMClient = Depends()
):
    """Handle incoming lead from FreeRateUpdate.com."""

    lead_data = await request.json()

    # Step 1: Validate TCPA consent
    if not validate_tcpa_consent(lead_data.get("consent", {})):
        logger.warning(f"Lead {lead_data['lead_id']} rejected: No TCPA consent")
        return {"status": "rejected", "reason": "No TCPA consent"}

    # Step 2: Parallel execution - create lead, generate quote, trigger campaign
    crm_lead, quote, campaign_result = await asyncio.gather(
        crm.create_lead({
            "source": "freerateupdate",
            "external_id": lead_data["lead_id"],
            "contact": lead_data["borrower"],
            "loan_details": lead_data["loan_details"],
            "priority": "high"  # Shared leads are high priority
        }),
        quote_engine.generate_quote(lead_data["loan_details"]),
        campaign_engine.trigger_campaign(
            campaign_id="immediate_response",
            lead_data=lead_data
        )
    )

    return {
        "status": "accepted",
        "lead_id": crm_lead["id"],
        "quote_generated": True,
        "campaign_triggered": True,
        "response_time_seconds": (datetime.utcnow() - lead_data["timestamp"]).total_seconds()
    }
```

### Pattern 2: LLM Gateway with Fallback

```python
# services/nexus-router/app/gateway.py
from typing import List, Dict, Optional
import asyncio
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

class MultiProviderGateway:
    """Route LLM requests to multiple providers with fallback."""

    def __init__(self):
        self.anthropic = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.openai = AsyncOpenAI(api_key=settings.OPENROUTER_API_KEY,
                                   base_url="https://openrouter.ai/api/v1")
        self.provider_order = ["anthropic", "openrouter", "google"]

    async def complete(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> Dict:
        """Complete prompt with automatic fallback."""

        errors = []

        for provider in self.provider_order:
            try:
                if provider == "anthropic":
                    response = await self.anthropic.messages.create(
                        model=model or "claude-3-5-sonnet-20241022",
                        max_tokens=max_tokens,
                        temperature=temperature,
                        messages=[{"role": "user", "content": prompt}]
                    )
                    return {
                        "provider": "anthropic",
                        "content": response.content[0].text,
                        "tokens": {
                            "input": response.usage.input_tokens,
                            "output": response.usage.output_tokens,
                            "total": response.usage.input_tokens + response.usage.output_tokens
                        }
                    }

                elif provider == "openrouter":
                    response = await self.openai.chat.completions.create(
                        model=model or "anthropic/claude-3.5-sonnet",
                        max_tokens=max_tokens,
                        temperature=temperature,
                        messages=[{"role": "user", "content": prompt}]
                    )
                    return {
                        "provider": "openrouter",
                        "content": response.choices[0].message.content,
                        "tokens": {
                            "input": response.usage.prompt_tokens,
                            "output": response.usage.completion_tokens,
                            "total": response.usage.total_tokens
                        }
                    }

            except Exception as e:
                errors.append(f"{provider}: {str(e)}")
                logger.warning(f"Provider {provider} failed: {e}")
                continue

        # All providers failed
        raise Exception(f"All LLM providers failed: {errors}")
```

---

## 📧 n8n Campaign Templates

### Template: Immediate Response Campaign

```json
{
  "name": "Immediate Response - New Lead",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook/new-lead",
        "responseMode": "onReceived"
      },
      "name": "Webhook - New Lead",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Validate TCPA consent\nconst lead = $input.item.json;\n\nif (!lead.consent || !lead.consent.tcpa_agreed) {\n  throw new Error('TCPA consent missing');\n}\n\nreturn { json: lead };"
      },
      "name": "Validate TCPA",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "http://10.0.0.1:8001/api/quotes/generate",
        "method": "POST",
        "jsonParameters": true,
        "options": {}
      },
      "name": "Generate Quote",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300]
    },
    {
      "parameters": {
        "mode": "multiple",
        "values": {
          "string": [
            {
              "name": "template",
              "value": "new_lead_welcome_with_quote"
            },
            {
              "name": "to",
              "value": "={{ $json.borrower.email }}"
            }
          ],
          "object": [
            {
              "name": "variables",
              "value": "={{ { first_name: $json.borrower.first_name, interest_rate: $json.quote.interest_rate, monthly_payment: $json.quote.monthly_payment } }}"
            }
          ]
        }
      },
      "name": "Send Email",
      "type": "n8n-nodes-base.set",
      "position": [850, 200]
    },
    {
      "parameters": {
        "authentication": "twilioApi",
        "fromPhoneNumber": "+15125551234",
        "toPhoneNumber": "={{ $json.borrower.phone }}",
        "message": "Hi {{ $json.borrower.first_name }}! Your mortgage quote is ready: {{ $json.quote.interest_rate }}% rate. View: https://ratehunter.net/quote/{{ $json.quote.id }}"
      },
      "name": "Send SMS",
      "type": "n8n-nodes-base.twilio",
      "position": [850, 400]
    }
  ],
  "connections": {
    "Webhook - New Lead": {
      "main": [[{ "node": "Validate TCPA", "type": "main", "index": 0 }]]
    },
    "Validate TCPA": {
      "main": [[{ "node": "Generate Quote", "type": "main", "index": 0 }]]
    },
    "Generate Quote": {
      "main": [
        [
          { "node": "Send Email", "type": "main", "index": 0 },
          { "node": "Send SMS", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}
```

### Template: 30-Day Nurture Drip

```json
{
  "name": "30-Day Nurture Drip Campaign",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 9 * * *" }]
        }
      },
      "name": "Schedule - Daily 9 AM",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "http://10.0.0.2:3000/api/leads?status=nurture",
        "method": "GET"
      },
      "name": "Get Nurture Leads",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Calculate days since lead creation\nconst leads = $input.all();\nconst today = new Date();\n\nconst scheduled = leads.map(lead => {\n  const createdDate = new Date(lead.json.created_at);\n  const daysSince = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));\n  \n  // Determine which campaign day to send\n  let campaignDay = null;\n  if (daysSince === 2) campaignDay = 'day_2_education';\n  else if (daysSince === 5) campaignDay = 'day_5_checkin';\n  else if (daysSince === 7) campaignDay = 'day_7_case_study';\n  else if (daysSince === 14) campaignDay = 'day_14_market_update';\n  else if (daysSince === 21) campaignDay = 'day_21_urgency';\n  else if (daysSince === 30) campaignDay = 'day_30_final';\n  \n  return {\n    json: {\n      ...lead.json,\n      campaign_day: campaignDay,
      days_since_creation: daysSince\n    }\n  };\n});\n\nreturn scheduled.filter(l => l.json.campaign_day !== null);"
      },
      "name": "Determine Campaign Day",
      "type": "n8n-nodes-base.function",
      "position": [650, 300]
    },
    {
      "parameters": {
        "rules": {
          "values": [
            { "conditions": { "string": [{ "value1": "={{ $json.campaign_day }}", "value2": "day_2_education" }] } },
            { "conditions": { "string": [{ "value1": "={{ $json.campaign_day }}", "value2": "day_5_checkin" }] } },
            { "conditions": { "string": [{ "value1": "={{ $json.campaign_day }}", "value2": "day_7_case_study" }] } }
          ]
        }
      },
      "name": "Switch - Campaign Day",
      "type": "n8n-nodes-base.switch",
      "position": [850, 300]
    }
  ]
}
```

---

## 🐳 Docker Compose Templates

### Template: Full-Stack Service with Database

```yaml
version: '3.9'

services:
  # Application Service
  quote-engine:
    build:
      context: ./services/quote-engine
      dockerfile: Dockerfile
      target: production
    image: ghcr.io/project-nyra/quote-engine:latest
    container_name: quote-engine
    restart: unless-stopped
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://${QUOTE_DB_USER}:${QUOTE_DB_PASSWORD}@postgres-quote:5432/quote_engine
      - REDIS_URL=redis://redis:6379/0
      - NEXUS_URL=http://nexus-router:6000
      - LOG_LEVEL=INFO
      - PROMETHEUS_ENABLED=true
    depends_on:
      postgres-quote:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - nyra-net
    volumes:
      - quote-logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  # Database Service
  postgres-quote:
    image: postgres:15-alpine
    container_name: postgres-quote
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${QUOTE_DB_USER}
      - POSTGRES_PASSWORD=${QUOTE_DB_PASSWORD}
      - POSTGRES_DB=quote_engine
      - POSTGRES_SHARED_BUFFERS=512MB
      - POSTGRES_EFFECTIVE_CACHE_SIZE=2GB
    volumes:
      - postgres-quote-data:/var/lib/postgresql/data
      - ./services/quote-engine/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - nyra-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${QUOTE_DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

networks:
  nyra-net:
    name: nyra-net
    driver: bridge

volumes:
  postgres-quote-data:
  quote-logs:
```

---

## 📚 API Client Examples

### Python API Client (for services)

```python
# lib/api_client.py
import httpx
from typing import Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

class APIClient:
    """Base API client with retry and error handling."""

    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=30.0,
            headers={"Authorization": f"Bearer {api_key}"} if api_key else {}
        )

    async def get(self, endpoint: str, params: Optional[Dict] = None) -> Any:
        """GET request with automatic retry."""
        for attempt in range(3):
            try:
                response = await self.client.get(endpoint, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.warning(f"Request failed (attempt {attempt + 1}/3): {e}")
                if attempt == 2:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

    async def post(self, endpoint: str, data: Dict) -> Any:
        """POST request with automatic retry."""
        for attempt in range(3):
            try:
                response = await self.client.post(endpoint, json=data)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.warning(f"Request failed (attempt {attempt + 1}/3): {e}")
                if attempt == 2:
                    raise
                await asyncio.sleep(2 ** attempt)

    async def close(self):
        """Close client session."""
        await self.client.aclose()

# Usage example
class QuoteEngineClient(APIClient):
    """Client for Quote Engine API."""

    def __init__(self):
        super().__init__(base_url="http://10.0.0.1:8001")

    async def generate_quote(self, loan_data: Dict) -> Dict:
        """Generate mortgage quote."""
        return await self.post("/api/quotes/generate", loan_data)

    async def get_quote(self, quote_id: str) -> Dict:
        """Retrieve quote by ID."""
        return await self.get(f"/api/quotes/{quote_id}")
```

### TypeScript API Client (for frontend)

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Retry on network error (3 attempts)
        if (error.message === 'Network Error' && !originalRequest._retry) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          if (originalRequest._retryCount < 3) {
            await new Promise((resolve) =>
              setTimeout(resolve, 2 ** originalRequest._retryCount * 1000)
            );
            return this.client(originalRequest);
          }
        }

        // Redirect to login on 401
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export default new APIClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001');
```

---

## 🧪 Testing Templates

### pytest Configuration

```python
# tests/conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from app.main import app
from app.database import get_db, Base, engine

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
async def db_session():
    """Create test database session."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db_session):
    """Create test API client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def mock_quote_data():
    """Sample quote request data."""
    return {
        "property_value": 450000,
        "down_payment": 90000,
        "credit_score": 740,
        "loan_type": "conventional",
        "term": 30
    }
```

### API Endpoint Test

```python
# tests/test_quotes.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_generate_quote_success(client: AsyncClient, mock_quote_data):
    """Test successful quote generation."""
    response = await client.post("/api/quotes/generate", json=mock_quote_data)

    assert response.status_code == 200
    data = response.json()

    # Validate response structure
    assert "quote_id" in data
    assert "interest_rate" in data
    assert "apr" in data
    assert "monthly_payment" in data
    assert "closing_costs" in data

    # Validate data types
    assert isinstance(data["interest_rate"], float)
    assert data["interest_rate"] > 0
    assert data["apr"] > data["interest_rate"]  # APR always > rate

@pytest.mark.asyncio
async def test_generate_quote_compliance_validation(client: AsyncClient):
    """Test compliance validation in quote generation."""
    # Invalid: DTI too high
    invalid_data = {
        "property_value": 200000,
        "down_payment": 10000,
        "credit_score": 620,
        "annual_income": 30000,  # Very low income = high DTI
        "monthly_debts": 3000     # High debts
    }

    response = await client.post("/api/quotes/generate", json=invalid_data)

    assert response.status_code == 400
    data = response.json()
    assert "DTI exceeds maximum" in data["detail"]
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Maintained By**: Project Nyra Team
**Related Docs**:
- [Best Practices Guide](./BEST-PRACTICES-GUIDE.md)
- [Complete Setup Guide](./COMPLETE-SETUP-GUIDE.md)
- [Containerization Guide](./CONTAINERIZATION-GUIDE.md)
