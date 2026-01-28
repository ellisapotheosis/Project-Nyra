# Quote Engine - Mortgage Rate Calculation & Lender Comparison

## 🎯 SERVICE CONTEXT

**Purpose**: FastAPI service for real-time mortgage quote calculations, multi-lender rate comparison, APR computation, closing costs, compliance-first rate sheets.

**Port**: 8001 | **Language**: Python 3.11 + FastAPI
**Dependencies**: fastapi, numpy, pandas, requests, redis, sqlalchemy

## 🚨 CRITICAL RULES

### Compliance-First Development
Every quote MUST include TILA/RESPA/TRID compliance:
- APR disclosure (TILA Regulation Z)
- Good Faith Estimate (itemized closing costs)
- Rate lock disclaimer + expiration
- Anti-steering validation (3+ loan options)
- Fair lending compliance (no protected class discrimination)
- State-specific regulations + audit trail

### Async Patterns (MANDATORY)
```python
# ✅ All lender queries parallel via asyncio.gather()
tasks = [lender.get_rate(...) for lender in lenders]
results = await asyncio.gather(*tasks, return_exceptions=True)

# APR calculation - no external I/O, cpu-bound
def calculate_apr(loan_amount, interest_rate, term_months, fees):
    # Newton's method for APR per TILA 12 CFR 1026.22
    apr_guess = float(interest_rate)
    for _ in range(100):
        # Iterative approximation...
    return round(apr_guess, 3)
```

## 📊 ARCHITECTURE

**Quote Flow**:
Quote Request → Validate Inputs (LTV, credit, limits) → Query Lenders (parallel) → Calculate APR → Estimate Closing Costs (state-based) → Generate Rate Sheet → Store + Cache → Return with TILA/RESPA disclosures

**Loan Types**:
| Type | Min Credit | Max LTV | Notes |
|------|-----------|---------|-------|
| Conventional | 620 | 97% | PMI if >80% LTV |
| FHA | 580 | 96.5% | MIP 1.75% + 0.55-1.05% annual |
| VA | None | 100% | Funding fee 2.15-3.3%, vets only |
| Jumbo | 700+ | 80% | >$766,550, higher rates |

## 🔧 FASTAPI PATTERNS

### Quote Endpoint with Validation
```python
@router.post("/quotes", response_model=QuoteResponse, status_code=201)
async def create_quote(
    req: QuoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate LTV
    ltv = (req.loan_amount / req.property_value) * 100
    if ltv > 97 and req.loan_type == "conventional":
        raise HTTPException(400, "LTV exceeds 97% for conventional")

    # Generate quote with multiple scenarios
    quote = await generate_quote(db, req, current_user.id)
    return QuoteResponse.from_orm(quote)
```

### APR Calculation (TILA 12 CFR 1026.22)
```python
from decimal import Decimal

def calculate_apr(
    loan_amount: float, interest_rate: float, term_months: int,
    origination_fee: float = 0, discount_points: float = 0, other_fees: float = 0
) -> float:
    """APR includes: interest + origination + points + insurance. Excludes: title, appraisal."""
    monthly_rate = Decimal(interest_rate) / Decimal(1200)
    monthly_payment = loan_amount * (
        monthly_rate * (1 + monthly_rate) ** term_months
    ) / ((1 + monthly_rate) ** term_months - 1)

    amount_financed = loan_amount - origination_fee - discount_points
    apr_guess = float(interest_rate)

    for _ in range(100):
        monthly_apr = apr_guess / 1200
        pv = sum([monthly_payment / ((1 + monthly_apr) ** m) for m in range(1, term_months + 1)])
        if abs(pv - amount_financed) < 0.01:
            return round(apr_guess, 3)
        apr_guess += (amount_financed - pv) / 100

    return round(apr_guess, 3)
```

### Parallel Lender Queries
```python
async def query_lenders(loan_amount, property_value, credit_score, loan_type, zip_code):
    """Query all lenders concurrently."""
    tasks = [
        RocketMortgageAPI().get_rate(...),
        LenderPriceAPI().get_rate(...),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    valid = [r for r in results if not isinstance(r, Exception)]
    return {
        "best_rate": min(r["interest_rate"] for r in valid),
        "average_rate": sum(r["interest_rate"] for r in valid) / len(valid),
        "lender_count": len(valid),
        "rates": sorted(valid, key=lambda r: r["apr"])
    }
```

## 🧪 TESTING

```python
import pytest
from app.calculations.apr import calculate_apr

def test_apr_accuracy():
    """TILA tolerance: ±0.125%"""
    apr = calculate_apr(200000, 4.5, 360, 2000, 2000, 500)
    assert apr > 4.5  # Higher than interest rate due to fees
    assert abs(apr - 4.65) < 0.125  # Within TILA tolerance
```

## 📈 PERFORMANCE TARGETS

- Quote endpoint: <2s p95 | APR calc: <10ms | Multi-lender query: <1s (parallel)
- Rate sheet: <500ms | Cache hit: >80% | APR accuracy: ±0.125% (TILA)
- Disclosure inclusion: 100% | Anti-steering: 100%

---

**Mathematical precision + regulatory compliance are non-negotiable. Borrowers rely on these quotes for life-changing decisions.**
