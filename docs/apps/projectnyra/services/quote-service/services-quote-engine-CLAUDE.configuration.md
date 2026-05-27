# Quote Engine - Mortgage Calculation Service

## 🎯 SERVICE CONTEXT

**Purpose**: FastAPI service providing real-time mortgage rate calculations, loan product comparisons, and approval likelihood scoring for Project Nyra.

**Port**: 8001  
**Language**: Python 3.11 + FastAPI + Pydantic  
**Dependencies**: SQLAlchemy (async), httpx, numpy, pandas  
**Template**: CLAUDE-MD-Python.md (mesh topology for data processing)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel FastAPI Development Pattern

**MANDATORY**: All API endpoints, models, and tests MUST be developed in parallel batches:

```python
# ✅ CORRECT: Batch development in ONE message
[Single Message]:
  # Core calculation endpoints
  - Write("app/routers/conventional.py", conventionalCalculations)
  - Write("app/routers/fha.py", fhaCalculations)
  - Write("app/routers/va.py", vaCalculations)
  - Write("app/routers/jumbo.py", jumboCalculations)

  # Pydantic models for all loan types
  - Write("app/models/loan_request.py", allLoanModels)
  - Write("app/models/loan_response.py", allResponseModels)

  # Pytest test suites
  - Write("tests/test_conventional.py", conventionalTests)
  - Write("tests/test_fha.py", fhaTests)
  - Write("tests/test_va.py", vaTests)

  # Run all tests in parallel
  - Bash("pytest -n auto tests/")

# ❌ WRONG: Sequential endpoint development
[Message 1]: Write conventional endpoint
[Message 2]: Write FHA endpoint
[Message 3]: Write VA endpoint
```

### Compliance-First Calculation Rules

**CRITICAL**: Every mortgage calculation MUST include compliance validation:

- **APR Disclosure**: Calculate and return APR per TILA Regulation Z Section 1026.22
- **Good Faith Estimate**: Provide itemized closing cost breakdown per RESPA Section 5
- **Loan Limits**: Validate against current FHFA conforming loan limits (updated annually)
- **DTI Requirements**: Enforce 43% maximum debt-to-income ratio per ATR/QM rules
- **Rate Lock**: Include rate lock expiration and extension fees
- **PMI Requirements**: Calculate PMI for LTV > 80% on conventional loans
- **VA Funding Fee**: Calculate VA funding fee based on down payment and veteran status
- **FHA MIP**: Calculate both upfront (1.75%) and annual MIP premiums

## 📊 QUOTE ENGINE ARCHITECTURE

### Calculation Pipeline

```
Loan Request → Input Validation → Credit Score Check → DTI Calculation
    ↓
Rate Lookup (lenderprice.com API) → Fee Calculation → PMI/MIP Calculation
    ↓
APR Calculation → Disclosure Generation → Compliance Validation
    ↓
Response with Good Faith Estimate
```

### Supported Loan Products

1. **Conventional** (conforming/high-balance/jumbo)
   - Fixed-rate: 10, 15, 20, 25, 30 year
   - ARM: 3/1, 5/1, 7/1, 10/1
   - LTV up to 97% with PMI

2. **FHA**
   - Fixed-rate: 15, 30 year
   - ARM: 3/1, 5/1
   - Max LTV 96.5%
   - Upfront MIP: 1.75%
   - Annual MIP: 0.55-0.85% (depends on LTV and term)

3. **VA**
   - Fixed-rate: 10, 15, 20, 25, 30 year
   - ARM: 3/1, 5/1
   - 100% financing (0% down)
   - Funding fee: 0-3.3% (varies by down payment, first-time use, disability status)

4. **Jumbo**
   - Loans above conforming limits ($766,550 in most areas, $1,149,825 in high-cost areas as of 2024)
   - Minimum 10-20% down payment required
   - Higher credit score requirements (typically 700+)

5. **Non-QM**
   - Bank statement loans
   - DSCR (debt service coverage ratio) investor loans
   - Interest-only options
   - Alternative income documentation

6. **Reverse Mortgage** (HECM)
   - Age 62+ requirement
   - Principal limit calculation based on age and home value
   - Counseling requirement

7. **HELOC/HELOAN**
   - Home equity lines of credit
   - Home equity loans (second mortgages)
   - Combined loan-to-value (CLTV) calculations

## 🧠 QUOTE ENGINE SWARM

### Agent Configuration

```yaml
topology: mesh # Optimal for data processing workflows
maxAgents: 6
strategy: parallel
language: python
framework: fastapi

agents:
  mortgage_calculation_specialist:
    role: Core Calculation Logic
    focus: [apr-calculation, pmi-calculation, fee-structures]
    responsibilities:
      - Implement accurate mortgage formulas
      - Handle compound interest calculations
      - Calculate amortization schedules
      - Compute total interest over loan life
    concurrent_tasks: [multiple-loan-types, parallel-calculations]

  rate_integration_engineer:
    role: External Rate API Integration
    focus: [lenderprice-api, rate-caching, fallback-rates]
    responsibilities:
      - Integrate with lenderprice.com API
      - Implement rate caching strategy (Redis)
      - Handle API failures gracefully
      - Provide fallback rate logic
    concurrent_tasks: [multiple-lenders, parallel-api-calls]

  compliance_validator:
    role: Regulatory Compliance Enforcement
    focus: [tila-respa, cfpb-rules, state-regulations]
    responsibilities:
      - Validate all calculations meet TILA requirements
      - Ensure RESPA disclosure completeness
      - Check state-specific regulations
      - Flag potential fair lending issues
    concurrent_tasks: [multiple-validations, parallel-rule-checks]

  model_architect:
    role: Pydantic Model Design
    focus: [type-safety, validation-rules, api-schemas]
    responsibilities:
      - Design comprehensive Pydantic models
      - Implement validation logic
      - Create OpenAPI schemas
      - Ensure type safety throughout
    concurrent_tasks: [multiple-models, parallel-schemas]

  test_engineer:
    role: Comprehensive Testing
    focus: [pytest, property-testing, integration-tests]
    responsibilities:
      - Write unit tests for all calculations
      - Create property-based tests (hypothesis)
      - Implement integration tests
      - Ensure 95%+ code coverage
    concurrent_tasks: [multiple-test-suites, parallel-execution]

  performance_optimizer:
    role: Speed & Efficiency
    focus: [async-patterns, caching, database-optimization]
    responsibilities:
      - Optimize calculation performance
      - Implement caching strategies
      - Profile and fix bottlenecks
      - Achieve <500ms p95 latency
    concurrent_tasks: [multiple-optimizations, parallel-benchmarks]
```

## 🔧 FASTAPI PATTERNS

### Async Endpoint Structure

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, validator
from typing import Optional, List
import asyncio

app = FastAPI(title="Nyra Quote Engine", version="1.0.0")

class ConventionalQuoteRequest(BaseModel):
    """Request model for conventional loan quote"""
    loan_amount: int = Field(..., gt=0, description="Loan amount in dollars")
    home_value: int = Field(..., gt=0, description="Home purchase price or appraised value")
    credit_score: int = Field(..., ge=300, le=850, description="FICO score")
    down_payment: int = Field(..., ge=0, description="Down payment amount in dollars")
    loan_term_years: int = Field(..., description="Loan term in years (10, 15, 20, 25, 30)")
    property_type: str = Field(..., description="Property type: single_family, condo, etc.")
    occupancy: str = Field(..., description="primary_residence, second_home, investment")
    property_zip: str = Field(..., regex=r"^\d{5}$", description="Property ZIP code")

    @validator('loan_term_years')
    def validate_loan_term(cls, v):
        """Ensure loan term is supported"""
        allowed_terms = [10, 15, 20, 25, 30]
        if v not in allowed_terms:
            raise ValueError(f"Loan term must be one of: {allowed_terms}")
        return v

    @validator('loan_amount', 'home_value')
    def validate_positive_amounts(cls, v):
        """Ensure amounts are positive and reasonable"""
        if v <= 0:
            raise ValueError("Amount must be positive")
        if v > 100_000_000:  # $100 million cap
            raise ValueError("Amount exceeds maximum allowed")
        return v

class ConventionalQuoteResponse(BaseModel):
    """Response model for conventional loan quote"""
    loan_amount: int
    interest_rate: float = Field(..., description="Note rate (not APR)")
    apr: float = Field(..., description="Annual Percentage Rate including fees")
    monthly_payment: float = Field(..., description="Principal + Interest payment")
    monthly_pmi: Optional[float] = Field(None, description="PMI payment if LTV > 80%")
    total_monthly: float = Field(..., description="Total monthly including PMI")
    ltv: float = Field(..., description="Loan-to-value ratio as percentage")
    estimated_closing_costs: float
    estimated_cash_to_close: float
    loan_term_months: int
    total_interest_paid: float = Field(..., description="Total interest over life of loan")
    compliance_status: str = Field(..., description="PASS or FAIL with reasons")
    good_faith_estimate: dict = Field(..., description="RESPA-compliant cost breakdown")
    rate_lock_days: int = Field(default=30, description="Rate lock period in days")
    rate_lock_expires: str = Field(..., description="Rate lock expiration date ISO 8601")

@app.post("/api/v1/quotes/conventional", response_model=ConventionalQuoteResponse)
async def generate_conventional_quote(
    request: ConventionalQuoteRequest,
    rate_service: RateService = Depends(get_rate_service),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Generate comprehensive conventional loan quote with compliance validation"""

    try:
        # Calculate LTV
        ltv = (request.loan_amount / request.home_value) * 100

        # Parallel rate lookup and compliance check
        rate_task = asyncio.create_task(
            rate_service.get_conventional_rate(
                credit_score=request.credit_score,
                ltv=ltv,
                loan_amount=request.loan_amount,
                property_zip=request.property_zip
            )
        )

        compliance_task = asyncio.create_task(
            compliance_service.validate_conventional_loan(
                loan_amount=request.loan_amount,
                home_value=request.home_value,
                ltv=ltv,
                property_zip=request.property_zip
            )
        )

        # Wait for both operations
        rate_info, compliance_result = await asyncio.gather(rate_task, compliance_task)

        # If compliance fails, return error immediately
        if not compliance_result.passes:
            raise HTTPException(
                status_code=400,
                detail=f"Loan does not meet compliance requirements: {compliance_result.reasons}"
            )

        # Calculate monthly payment (principal + interest)
        monthly_rate = rate_info.interest_rate / 100 / 12
        num_payments = request.loan_term_years * 12

        if monthly_rate > 0:
            monthly_pi = request.loan_amount * (
                monthly_rate * (1 + monthly_rate)**num_payments
            ) / ((1 + monthly_rate)**num_payments - 1)
        else:
            monthly_pi = request.loan_amount / num_payments

        # Calculate PMI if LTV > 80%
        monthly_pmi = None
        if ltv > 80:
            pmi_rate = calculate_pmi_rate(credit_score=request.credit_score, ltv=ltv)
            monthly_pmi = (request.loan_amount * pmi_rate) / 12

        total_monthly = monthly_pi + (monthly_pmi or 0)

        # Calculate APR (includes fees)
        apr = calculate_apr(
            loan_amount=request.loan_amount,
            interest_rate=rate_info.interest_rate,
            fees=rate_info.fees,
            loan_term_years=request.loan_term_years
        )

        # Generate Good Faith Estimate
        gfe = generate_good_faith_estimate(
            loan_amount=request.loan_amount,
            interest_rate=rate_info.interest_rate,
            fees=rate_info.fees,
            property_value=request.home_value
        )

        # Calculate total interest over life of loan
        total_payments = monthly_pi * num_payments
        total_interest = total_payments - request.loan_amount

        # Rate lock expiration (30 days from now)
        from datetime import datetime, timedelta
        rate_lock_expires = (datetime.now() + timedelta(days=30)).isoformat()

        return ConventionalQuoteResponse(
            loan_amount=request.loan_amount,
            interest_rate=rate_info.interest_rate,
            apr=apr,
            monthly_payment=round(monthly_pi, 2),
            monthly_pmi=round(monthly_pmi, 2) if monthly_pmi else None,
            total_monthly=round(total_monthly, 2),
            ltv=round(ltv, 2),
            estimated_closing_costs=gfe["total_closing_costs"],
            estimated_cash_to_close=request.down_payment + gfe["total_closing_costs"],
            loan_term_months=num_payments,
            total_interest_paid=round(total_interest, 2),
            compliance_status="PASS",
            good_faith_estimate=gfe,
            rate_lock_days=30,
            rate_lock_expires=rate_lock_expires
        )

    except HTTPException:
        raise
    except Exception as e:
        # Log error to Loki
        logger.error(f"Quote generation failed: {str(e)}", extra={
            "loan_amount": request.loan_amount,
            "credit_score": request.credit_score
        })
        raise HTTPException(status_code=500, detail="Quote generation failed")
```

### Testing Pattern

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
@pytest.mark.parametrize("credit_score,expected_rate_range", [
    (800, (5.5, 6.5)),  # Excellent credit
    (720, (6.0, 7.0)),  # Good credit
    (680, (6.5, 7.5)),  # Fair credit
    (640, (7.0, 8.0)),  # Below average credit
])
async def test_conventional_quote_credit_score_impact(credit_score, expected_rate_range):
    """Test that credit scores appropriately impact interest rates"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/quotes/conventional", json={
            "loan_amount": 300000,
            "home_value": 400000,
            "credit_score": credit_score,
            "down_payment": 100000,
            "loan_term_years": 30,
            "property_type": "single_family",
            "occupancy": "primary_residence",
            "property_zip": "92675"
        })

        assert response.status_code == 200
        data = response.json()

        # Rate should be within expected range for credit score
        assert expected_rate_range[0] <= data["interest_rate"] <= expected_rate_range[1]

        # APR should always be higher than note rate (includes fees)
        assert data["apr"] > data["interest_rate"]

        # LTV should be 75% (300k loan on 400k home)
        assert data["ltv"] == 75.0

        # No PMI required (LTV < 80%)
        assert data["monthly_pmi"] is None

        # Compliance should pass
        assert data["compliance_status"] == "PASS"
```

## 🔒 SECURITY & DATA PROTECTION

### PII Handling

**CRITICAL**: Never log or store sensitive borrower information:

- Social Security Numbers (SSN)
- Bank account numbers
- Tax returns or income verification documents
- Employment verification documents

### Input Validation

All numeric inputs MUST be validated:

- Positive amounts only
- Reasonable maximum limits ($100M loan cap)
- Credit scores 300-850 range
- ZIP codes 5-digit format
- DTI ratios 0-100% range

### Rate Data Security

- Cache rates in Redis with 15-minute TTL
- Encrypt lenderprice.com API keys
- Log all rate queries for audit trail
- Include timestamps on all rate quotes

## 📈 PERFORMANCE TARGETS

### Response Time Requirements

- Quote generation: < 500ms p95 latency
- Rate API lookup: < 200ms p95 latency
- Database queries: < 50ms p95 latency
- Health check: < 10ms p95 latency

### Throughput Requirements

- 10 concurrent quote requests without degradation
- 1000 quotes per hour sustained
- Handle rate API failures gracefully with fallback rates

### Resource Optimization

- Use Redis caching for frequently requested rates
- Implement connection pooling for database
- Use async patterns throughout for non-blocking I/O
- Profile with py-spy and optimize hot paths

## 🧪 TESTING REQUIREMENTS

### Test Coverage Targets

- Unit tests: 95%+ line coverage
- Integration tests: All API endpoints
- Property-based tests: All calculation functions
- Load tests: 10 concurrent users

### Test Data Strategy

Use hypothesis for property-based testing:

```python
from hypothesis import given, strategies as st

@given(
    loan_amount=st.integers(min_value=50000, max_value=10000000),
    home_value=st.integers(min_value=50000, max_value=15000000),
    credit_score=st.integers(min_value=300, max_value=850)
)
def test_conventional_quote_properties(loan_amount, home_value, credit_score):
    """Property-based test ensuring quote calculations are always valid"""
    # Ensure home value >= loan amount (otherwise invalid LTV)
    home_value = max(home_value, loan_amount)

    response = generate_quote(loan_amount, home_value, credit_score)

    # Properties that should ALWAYS hold:
    assert response.apr >= response.interest_rate  # APR includes fees
    assert response.ltv == (loan_amount / home_value) * 100
    assert response.total_monthly >= response.monthly_payment

    if response.ltv > 80:
        assert response.monthly_pmi is not None  # PMI required
    else:
        assert response.monthly_pmi is None  # No PMI needed
```

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Docker health check configured (`/health` endpoint)
- [ ] Prometheus metrics endpoint (`/metrics`)
- [ ] Structured logging to Loki (JSON format)
- [ ] Redis connection pool configured
- [ ] PostgreSQL async engine configured
- [ ] Environment variables properly injected from Infisical
- [ ] All API endpoints documented in OpenAPI schema
- [ ] Rate limiting configured (10 req/sec per IP)
- [ ] CORS properly configured for RateHunter and Nyra Admin origins
- [ ] SSL/TLS enforced for all external API calls

---

**This service is the core calculation engine for Project Nyra. All mortgage quotes flow through here. Compliance validation is non-negotiable - if a loan doesn't meet regulatory requirements, it MUST be rejected.**
