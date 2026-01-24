# Quote Engine - Mortgage Rate Calculation & Lender Comparison

## 🎯 SERVICE CONTEXT

**Purpose**: Python FastAPI service for real-time mortgage quote calculations, multi-lender rate comparison, APR computation, closing cost estimation, and compliance-first rate sheets for Project Nyra.

**Port**: 8001
**Language**: Python 3.11 + FastAPI
**Dependencies**: fastapi, numpy, pandas, requests, redis, celery
**Template**: Python/FastAPI backend service (mesh topology for parallel lender queries)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Rate Calculation Pattern
**MANDATORY**: All quote calculations, lender API calls, and validations MUST be parallel:

```python
# ✅ CORRECT: Batch development in ONE message
[Single Message]:
  // Quote endpoints
  - Write("app/api/quotes.py", quoteCRUD)
  - Write("app/api/rates.py", rateComparison)
  - Write("app/api/calculations.py", calculatorEndpoints)

  // Calculation engines
  - Write("app/calculations/apr.py", aprCalculator)
  - Write("app/calculations/payment.py", paymentCalculator)
  - Write("app/calculations/ltv.py", ltvCalculator)

  // Lender integrations
  - Write("app/lenders/rocket_mortgage.py", rocketAPI)
  - Write("app/lenders/lender_price.py", lenderPriceAPI)
  - Write("app/lenders/rate_aggregator.py", multiLenderQuery)

  // Tests
  - Write("tests/test_calculations.py", calculationTests)
  - Bash("pytest tests/")
```

### Compliance-First Rate Quote Rules
**CRITICAL**: Every rate quote MUST comply with TILA/RESPA/TRID:

- **APR Disclosure**: Always show APR alongside interest rate (TILA Regulation Z)
- **Good Faith Estimate**: Provide itemized closing costs (RESPA Section 4)
- **Rate Lock Disclaimer**: Clearly state rate lock period and expiration
- **Anti-Steering**: Show multiple loan options, not just highest-commission
- **Fair Lending**: No rate discrimination based on protected classes
- **State Compliance**: Respect state-specific mortgage regulations
- **Audit Trail**: Log all quote requests with inputs, outputs, timestamp

## 📊 QUOTE ENGINE ARCHITECTURE

### Quote Generation Flow
```
Quote Request (borrower data + property info)
    ↓
Validate Inputs → Credit score, income, loan amount, property value
    ↓
Calculate LTV Ratio → loan_amount / property_value
    ↓
Determine Loan Type → Conventional, FHA, VA, Jumbo based on loan amount/LTV
    ↓
Query Multiple Lenders in Parallel → Rocket Mortgage, LenderPrice, etc.
    ↓
Calculate Base Rate → Average of lender responses
    ↓
Apply Rate Adjustments → Credit score, LTV, loan type, property type
    ↓
Calculate APR → Include all fees (origination, points, insurance)
    ↓
Estimate Monthly Payment → P&I + taxes + insurance + HOA + PMI
    ↓
Calculate Closing Costs → By state (title, recording, attorney, taxes)
    ↓
Generate Rate Sheet → Multiple loan options with APR, payments, costs
    ↓
Store Quote in DB → Cache in Redis (15 min TTL)
    ↓
Return Quote Response → Include TILA/RESPA disclosures
```

### Supported Loan Types

**1. Conventional Loans**
- Min credit score: 620
- LTV: Up to 97% with PMI
- Loan limits: Up to $766,550 (2024 conforming limit)
- PMI required if LTV > 80%

**2. FHA Loans**
- Min credit score: 580 (3.5% down) or 500 (10% down)
- LTV: Up to 96.5%
- Mortgage Insurance Premium: Upfront 1.75% + annual 0.55-1.05%
- Loan limits: Vary by county

**3. VA Loans**
- Min credit score: None (lender overlays typically 620)
- LTV: Up to 100% (no down payment)
- Funding fee: 2.15-3.3% (waived for disabled veterans)
- Eligibility: Veterans, active duty, surviving spouses

**4. Jumbo Loans**
- Min credit score: 700+
- LTV: Up to 80% (may go higher with excellent credit)
- Loan amounts: Above $766,550
- Higher rates than conforming

## 🐝 QUOTE ENGINE SWARM

### Agent Configuration
```yaml
topology: mesh  # Parallel lender queries
maxAgents: 6
strategy: specialized
language: python
framework: fastapi

agents:
  rate_calculator:
    role: Mortgage Calculations
    focus: [apr-calculation, payment-calculation, ltv-ratios]
    responsibilities:
      - Calculate APR per TILA
      - Compute monthly payments
      - Determine LTV/CLTV ratios
      - Apply rate adjustments
    concurrent_tasks: [multiple-calculations, parallel-scenarios]

  lender_integrator:
    role: Multi-Lender Integration
    focus: [api-clients, parallel-requests, rate-aggregation]
    responsibilities:
      - Query multiple lenders
      - Aggregate rate responses
      - Handle API rate limits
      - Fallback logic
    concurrent_tasks: [multiple-lenders, parallel-api-calls]

  compliance_specialist:
    role: Regulatory Compliance
    focus: [tila-disclosure, respa-compliance, anti-steering]
    responsibilities:
      - Generate TILA disclosures
      - Ensure RESPA compliance
      - Validate anti-steering
      - Include required disclaimers
    concurrent_tasks: [multiple-validations, parallel-disclosures]

  pricing_engine:
    role: Rate Sheet Generation
    focus: [rate-adjustments, pricing-matrices, scenario-analysis]
    responsibilities:
      - Apply pricing adjustments
      - Generate rate sheets
      - Compare loan scenarios
      - Optimize pricing
    concurrent_tasks: [multiple-scenarios, parallel-pricing]

  closing_cost_estimator:
    role: Closing Cost Calculation
    focus: [state-regulations, fee-calculation, good-faith-estimate]
    responsibilities:
      - Estimate closing costs by state
      - Calculate title fees
      - Estimate recording fees
      - Generate itemized breakdown
    concurrent_tasks: [multiple-states, parallel-estimations]

  test_engineer:
    role: Calculation Testing
    focus: [pytest, compliance-testing, apr-validation]
    responsibilities:
      - Write calculation tests
      - Validate APR accuracy
      - Test edge cases
      - Compliance testing
    concurrent_tasks: [multiple-test-suites, parallel-execution]
```

## 🔧 FASTAPI + CALCULATION PATTERNS

### Quote Generation Endpoint
```python
from fastapi import APIRouter, Depends, HTTPException
from app.schemas import QuoteRequest, QuoteResponse
from app.services.quote_service import generate_quote
from app.dependencies import get_db, get_current_user
from app.calculations.apr import calculate_apr

router = APIRouter(prefix="/quotes", tags=["quotes"])

@router.post("", response_model=QuoteResponse, status_code=201)
async def create_quote(
    request: QuoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a mortgage quote with TILA/RESPA disclosures.

    Returns multiple loan scenarios with:
    - Interest rate and APR
    - Monthly payment breakdown
    - Estimated closing costs
    - Required disclosures
    """
    # Validate inputs
    if request.loan_amount > request.property_value:
        raise HTTPException(
            status_code=400,
            detail="Loan amount cannot exceed property value"
        )

    ltv = (request.loan_amount / request.property_value) * 100

    if ltv > 97 and request.loan_type == "conventional":
        raise HTTPException(
            status_code=400,
            detail="Conventional loans limited to 97% LTV"
        )

    # Generate quote with multiple scenarios
    quote = await generate_quote(
        db=db,
        request=request,
        user_id=current_user.id
    )

    return QuoteResponse.from_orm(quote)
```

### APR Calculation (TILA Regulation Z Compliant)
```python
import numpy as np
from decimal import Decimal

def calculate_apr(
    loan_amount: float,
    interest_rate: float,
    term_months: int,
    origination_fee: float = 0,
    discount_points: float = 0,
    other_fees: float = 0
) -> float:
    """
    Calculate APR per TILA Regulation Z (12 CFR 1026.22).

    APR includes:
    - Interest rate
    - Origination fees
    - Discount points
    - Prepaid interest
    - Mortgage insurance premiums
    - Other fees charged by lender

    Does NOT include:
    - Title insurance
    - Attorney fees
    - Appraisal fees
    - Credit report fees
    """
    # Calculate monthly payment based on interest rate
    monthly_rate = Decimal(interest_rate) / Decimal(12) / Decimal(100)
    monthly_payment = loan_amount * (
        monthly_rate * (1 + monthly_rate) ** term_months
    ) / ((1 + monthly_rate) ** term_months - 1)

    # Calculate finance charge (total interest + fees)
    total_payments = monthly_payment * term_months
    total_interest = total_payments - loan_amount
    finance_charge = total_interest + origination_fee + discount_points + other_fees

    # Amount financed (loan amount minus prepaid finance charges)
    amount_financed = loan_amount - origination_fee - discount_points

    # Solve for APR using iterative approximation (Newton's method)
    apr_guess = float(interest_rate)

    for _ in range(100):  # Max iterations
        monthly_apr = apr_guess / 12 / 100

        pv_payments = sum([
            monthly_payment / ((1 + monthly_apr) ** month)
            for month in range(1, term_months + 1)
        ])

        error = pv_payments - amount_financed

        if abs(error) < 0.01:
            return round(apr_guess, 3)

        # Adjust guess
        derivative = sum([
            -month * monthly_payment / ((1 + monthly_apr) ** (month + 1))
            for month in range(1, term_months + 1)
        ]) / 1200

        apr_guess -= error / derivative

    return round(apr_guess, 3)
```

### Multi-Lender Rate Query (Parallel)
```python
import asyncio
from typing import List, Dict
from app.lenders.rocket_mortgage import RocketMortgageAPI
from app.lenders.lender_price import LenderPriceAPI

async def query_all_lenders(
    loan_amount: float,
    property_value: float,
    credit_score: int,
    loan_type: str,
    zip_code: str
) -> List[Dict]:
    """
    Query multiple lenders in parallel for rate quotes.
    """
    lenders = [
        RocketMortgageAPI(),
        LenderPriceAPI(),
        # Add more lenders
    ]

    # Query all lenders concurrently
    tasks = [
        lender.get_rate(
            loan_amount=loan_amount,
            property_value=property_value,
            credit_score=credit_score,
            loan_type=loan_type,
            zip_code=zip_code
        )
        for lender in lenders
    ]

    # Wait for all responses (with timeout)
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out errors
    valid_rates = [
        rate for rate in results
        if not isinstance(rate, Exception)
    ]

    if not valid_rates:
        raise ValueError("No lenders returned rates")

    return valid_rates

def aggregate_rates(rates: List[Dict]) -> Dict:
    """
    Aggregate rates from multiple lenders.
    """
    return {
        "best_rate": min(rate["interest_rate"] for rate in rates),
        "average_rate": sum(rate["interest_rate"] for rate in rates) / len(rates),
        "lender_count": len(rates),
        "rates": sorted(rates, key=lambda r: r["apr"])
    }
```

### Closing Cost Estimator (State-Specific)
```python
CLOSING_COSTS_BY_STATE = {
    "CA": {
        "title_insurance": 0.0025,  # 0.25% of loan amount
        "recording_fees": 250,
        "transfer_tax": 0.0011,  # $1.10 per $1000
        "attorney_fees": 0  # Not required in CA
    },
    "NY": {
        "title_insurance": 0.005,
        "recording_fees": 350,
        "transfer_tax": 0.004,  # 0.4% for properties < $500k
        "attorney_fees": 2000  # Required in NY
    },
    # Add all 50 states
}

def estimate_closing_costs(
    loan_amount: float,
    property_value: float,
    state: str
) -> Dict:
    """
    Estimate closing costs by state.
    """
    costs = CLOSING_COSTS_BY_STATE.get(state, CLOSING_COSTS_BY_STATE["CA"])

    return {
        "title_insurance": loan_amount * costs["title_insurance"],
        "recording_fees": costs["recording_fees"],
        "transfer_tax": property_value * costs["transfer_tax"],
        "attorney_fees": costs["attorney_fees"],
        "appraisal": 500,
        "credit_report": 50,
        "flood_certification": 20,
        "tax_service": 85,
        "total": sum([...])  # Calculate total
    }
```

## 🔒 COMPLIANCE & SECURITY

### Anti-Steering Compliance
- Show borrower at least 3 loan options
- Include loans borrower is likely to qualify for
- Show best rate, lowest cost, and different term options

## 📈 PERFORMANCE TARGETS

### Quote Generation Performance
- Quote endpoint: < 2 seconds p95 latency
- APR calculation: < 10ms per calculation
- Multi-lender query: < 1 second (parallel)
- Rate sheet generation: < 500ms
- Cache hit rate: > 80% for popular scenarios

### Compliance Targets
- APR accuracy: ±0.125% (TILA tolerance)
- Disclosure inclusion: 100% of quotes
- Anti-steering: 100% show multiple options

## 🧪 TESTING REQUIREMENTS

```python
import pytest
from app.calculations.apr import calculate_apr

def test_apr_calculation_accuracy():
    # Test case from TILA Regulation Z examples
    apr = calculate_apr(
        loan_amount=200000,
        interest_rate=4.5,
        term_months=360,
        origination_fee=2000,
        discount_points=2000,  # 1 point
        other_fees=500
    )

    # APR should be higher than interest rate due to fees
    assert apr > 4.5
    assert apr < 5.0  # Reasonable range

    # Test APR accuracy (±0.125% TILA tolerance)
    expected_apr = 4.65
    assert abs(apr - expected_apr) < 0.125
```

---

**This service generates mortgage quotes that borrowers rely on for life-changing decisions. Every calculation must be accurate, every disclosure must be present, and every rate must comply with federal and state regulations. Mathematical precision and regulatory compliance are non-negotiable.**
