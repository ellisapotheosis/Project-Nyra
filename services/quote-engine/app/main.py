# Quote Engine - Mortgage Calculation Service
# Project Nyra Business Services
# Port: 8001
# Purpose: Generate mortgage quotes with rate calculations, PMI, closing costs

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import math
from typing import Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
import logging
import os
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Disable interactive docs in production
_is_production = os.environ.get("ENVIRONMENT", "development") == "production"

app = FastAPI(
    title="Nyra Quote Engine",
    version="1.0.0",
    description="Mortgage quote calculation service with intelligent rate pricing",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
)

# CORS middleware — restrict origins; credentials require explicit origin list
_cors_origins = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ============================================================================
# DATA MODELS
# ============================================================================

class LoanType(str, Enum):
    CONVENTIONAL = "conventional"
    FHA = "fha"
    VA = "va"
    USDA = "usda"
    JUMBO = "jumbo"

class QuoteRequest(BaseModel):
    """Mortgage quote request"""
    loan_amount: float = Field(..., gt=0, description="Loan amount in dollars")
    property_value: float = Field(..., gt=0, description="Property value in dollars")
    credit_score: int = Field(..., ge=300, le=850, description="FICO credit score")
    loan_type: LoanType = Field(..., description="Type of mortgage loan")
    loan_term: int = Field(..., description="Loan term in years (15 or 30)")
    down_payment: float = Field(..., ge=0, description="Down payment amount in dollars")
    property_state: str = Field(..., min_length=2, max_length=2, description="Two-letter state code")
    property_zip: str = Field(..., description="Property ZIP code")
    borrower_email: str = Field(..., description="Borrower email address")

class QuoteResponse(BaseModel):
    """Comprehensive mortgage quote"""
    quote_id: str
    loan_amount: float
    property_value: float
    down_payment: float
    ltv_ratio: float
    interest_rate: float
    monthly_payment: float
    principal_and_interest: float
    pmi_monthly: float
    estimated_taxes: float
    estimated_insurance: float
    total_monthly_payment: float
    closing_costs: float
    apr: float
    approval_likelihood: str
    approval_confidence: float
    created_at: str
    expires_at: str

class RateInfo(BaseModel):
    """Current rate information"""
    loan_type: str
    term_years: int
    base_rate: float
    as_of_date: str

# ============================================================================
# RATE TABLES & CONSTANTS
# ============================================================================

# Base rates by loan type and term (as of January 2026)
BASE_RATES = {
    ("conventional", 30): 6.875,
    ("conventional", 15): 6.125,
    ("fha", 30): 6.50,
    ("fha", 15): 5.875,
    ("va", 30): 6.375,
    ("va", 15): 5.75,
    ("usda", 30): 6.50,
    ("jumbo", 30): 7.25,
    ("jumbo", 15): 6.75,
}

# Credit score adjustments (in basis points, 1 bp = 0.01%)
CREDIT_SCORE_ADJUSTMENTS = {
    (760, 850): 0,      # Excellent - no adjustment
    (740, 759): 25,     # Very good - +0.25%
    (720, 739): 50,     # Good - +0.50%
    (700, 719): 75,     # Fair - +0.75%
    (680, 699): 100,    # Fair - +1.00%
    (660, 679): 150,    # Marginal - +1.50%
    (640, 659): 200,    # Poor - +2.00%
    (620, 639): 250,    # Poor - +2.50%
    (580, 619): 300,    # Very poor - +3.00%
    (300, 579): 400,    # Extremely poor - +4.00%
}

# LTV adjustments (in basis points)
LTV_ADJUSTMENTS = {
    (0, 60): 0,         # Excellent LTV - no adjustment
    (60, 70): 12.5,     # Very good - +0.125%
    (70, 80): 25,       # Good - +0.25%
    (80, 85): 50,       # Higher LTV - +0.50%
    (85, 90): 75,       # High LTV - +0.75%
    (90, 95): 100,      # Very high LTV - +1.00%
    (95, 100): 125,     # Extremely high LTV - +1.25%
}

# Closing costs by state (percentage of loan amount)
CLOSING_COSTS_BY_STATE = {
    "AL": 0.0198, "AK": 0.0221, "AZ": 0.0213, "AR": 0.0195, "CA": 0.0268,
    "CO": 0.0211, "CT": 0.0240, "DE": 0.0256, "FL": 0.0228, "GA": 0.0191,
    "HI": 0.0263, "ID": 0.0210, "IL": 0.0226, "IN": 0.0181, "IA": 0.0199,
    "KS": 0.0204, "KY": 0.0192, "LA": 0.0207, "ME": 0.0235, "MD": 0.0238,
    "MA": 0.0252, "MI": 0.0219, "MN": 0.0214, "MS": 0.0185, "MO": 0.0201,
    "MT": 0.0217, "NE": 0.0203, "NV": 0.0229, "NH": 0.0248, "NJ": 0.0258,
    "NM": 0.0215, "NY": 0.0290, "NC": 0.0188, "ND": 0.0212, "OH": 0.0193,
    "OK": 0.0197, "OR": 0.0234, "PA": 0.0245, "RI": 0.0255, "SC": 0.0183,
    "SD": 0.0208, "TN": 0.0189, "TX": 0.0272, "UT": 0.0218, "VT": 0.0242,
    "VA": 0.0196, "WA": 0.0237, "WV": 0.0194, "WI": 0.0205, "WY": 0.0216
}

# PMI rate (annual, as percentage of loan amount)
PMI_ANNUAL_RATE = 0.0055  # 0.55% typical

# ============================================================================
# CALCULATION FUNCTIONS
# ============================================================================

def calculate_ltv(loan_amount: float, property_value: float) -> float:
    """Calculate Loan-to-Value ratio"""
    return (loan_amount / property_value) * 100

def calculate_interest_rate(
    loan_type: str,
    loan_term: int,
    credit_score: int,
    ltv_ratio: float
) -> float:
    """Calculate interest rate based on loan parameters"""
    # Get base rate
    base_rate = BASE_RATES.get((loan_type, loan_term))
    if not base_rate:
        raise HTTPException(
            status_code=400,
            detail=f"No rate available for {loan_type} {loan_term}-year loan"
        )

    # Apply credit score adjustment
    credit_adjustment = 0
    for (min_score, max_score), adjustment in CREDIT_SCORE_ADJUSTMENTS.items():
        if min_score <= credit_score <= max_score:
            credit_adjustment = adjustment / 100  # Convert basis points to percentage
            break

    # Apply LTV adjustment
    ltv_adjustment = 0
    for (min_ltv, max_ltv), adjustment in LTV_ADJUSTMENTS.items():
        if min_ltv <= ltv_ratio < max_ltv:
            ltv_adjustment = adjustment / 100
            break

    final_rate = base_rate + credit_adjustment + ltv_adjustment
    return round(final_rate, 3)

def calculate_monthly_payment(
    loan_amount: float,
    annual_rate: float,
    loan_term_years: int
) -> float:
    """Calculate monthly principal and interest payment using amortization formula"""
    monthly_rate = annual_rate / 100 / 12
    num_payments = loan_term_years * 12

    if monthly_rate == 0:
        return loan_amount / num_payments

    # Amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    monthly_payment = loan_amount * (
        monthly_rate * math.pow(1 + monthly_rate, num_payments)
    ) / (
        math.pow(1 + monthly_rate, num_payments) - 1
    )

    return round(monthly_payment, 2)

def calculate_pmi(loan_amount: float, ltv_ratio: float) -> float:
    """Calculate monthly PMI if LTV > 80%"""
    if ltv_ratio <= 80:
        return 0.0

    annual_pmi = loan_amount * PMI_ANNUAL_RATE
    monthly_pmi = annual_pmi / 12
    return round(monthly_pmi, 2)

def estimate_property_taxes(property_value: float, state: str) -> float:
    """Estimate monthly property taxes (national average ~1.1% annually)"""
    # Could be refined by state tax rates
    annual_tax_rate = 0.011  # 1.1% national average
    annual_taxes = property_value * annual_tax_rate
    return round(annual_taxes / 12, 2)

def estimate_homeowners_insurance(property_value: float) -> float:
    """Estimate monthly homeowners insurance (national average ~0.35% annually)"""
    annual_insurance_rate = 0.0035  # 0.35% national average
    annual_insurance = property_value * annual_insurance_rate
    return round(annual_insurance / 12, 2)

def calculate_closing_costs(loan_amount: float, state: str) -> float:
    """Calculate estimated closing costs based on state"""
    closing_cost_rate = CLOSING_COSTS_BY_STATE.get(state.upper(), 0.0220)  # Default 2.2%
    closing_costs = loan_amount * closing_cost_rate
    return round(closing_costs, 2)

def calculate_apr(
    loan_amount: float,
    interest_rate: float,
    loan_term_years: int,
    closing_costs: float,
    pmi_monthly: float
) -> float:
    """Calculate APR including fees"""
    # Simplified APR calculation
    # APR accounts for interest rate + fees spread over loan term
    monthly_rate = interest_rate / 100 / 12
    num_payments = loan_term_years * 12

    # Adjust loan amount for fees
    adjusted_loan = loan_amount - closing_costs

    # Calculate effective rate including PMI
    if adjusted_loan <= 0:
        return interest_rate

    # Approximate APR (simplified - real APR calculation is more complex)
    total_interest = (calculate_monthly_payment(loan_amount, interest_rate, loan_term_years) * num_payments) - loan_amount
    total_pmi = pmi_monthly * num_payments
    total_cost = total_interest + closing_costs + total_pmi

    apr = (total_cost / loan_amount / loan_term_years) * 100
    return round(apr, 3)

def assess_approval_likelihood(credit_score: int, ltv_ratio: float, loan_type: str) -> tuple[str, float]:
    """Assess approval likelihood based on credit score and LTV"""
    confidence = 0.0

    # Excellent approval odds
    if credit_score >= 740 and ltv_ratio <= 80:
        likelihood = "Excellent"
        confidence = 0.95
    # Very good approval odds
    elif credit_score >= 700 and ltv_ratio <= 85:
        likelihood = "Very Good"
        confidence = 0.85
    # Good approval odds
    elif credit_score >= 680 and ltv_ratio <= 90:
        likelihood = "Good"
        confidence = 0.75
    # Fair approval odds
    elif credit_score >= 640 and ltv_ratio <= 95:
        likelihood = "Fair"
        confidence = 0.60
    # Marginal approval odds
    elif credit_score >= 620:
        likelihood = "Marginal"
        confidence = 0.45
    # Poor approval odds
    else:
        likelihood = "Poor"
        confidence = 0.25

    # FHA/VA/USDA are more forgiving
    if loan_type in ["fha", "va", "usda"] and confidence < 0.70:
        confidence += 0.10
        if likelihood == "Poor":
            likelihood = "Marginal"
        elif likelihood == "Marginal":
            likelihood = "Fair"

    return likelihood, round(confidence, 2)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.post("/quote", response_model=QuoteResponse)
async def generate_quote(request: QuoteRequest):
    """Generate comprehensive mortgage quote"""
    try:
        logger.info(f"Generating quote for {request.borrower_email}")

        # Calculate LTV
        ltv_ratio = calculate_ltv(request.loan_amount, request.property_value)

        # Validate down payment
        actual_down_payment = request.property_value - request.loan_amount
        if actual_down_payment < 0:
            raise HTTPException(
                status_code=400,
                detail="Loan amount cannot exceed property value"
            )

        # Calculate interest rate
        interest_rate = calculate_interest_rate(
            request.loan_type.value,
            request.loan_term,
            request.credit_score,
            ltv_ratio
        )

        # Calculate monthly P&I
        principal_and_interest = calculate_monthly_payment(
            request.loan_amount,
            interest_rate,
            request.loan_term
        )

        # Calculate PMI
        pmi_monthly = calculate_pmi(request.loan_amount, ltv_ratio)

        # Estimate property taxes and insurance
        estimated_taxes = estimate_property_taxes(request.property_value, request.property_state)
        estimated_insurance = estimate_homeowners_insurance(request.property_value)

        # Total monthly payment
        total_monthly = principal_and_interest + pmi_monthly + estimated_taxes + estimated_insurance

        # Calculate closing costs
        closing_costs = calculate_closing_costs(request.loan_amount, request.property_state)

        # Calculate APR
        apr = calculate_apr(
            request.loan_amount,
            interest_rate,
            request.loan_term,
            closing_costs,
            pmi_monthly
        )

        # Assess approval likelihood
        approval_likelihood, approval_confidence = assess_approval_likelihood(
            request.credit_score,
            ltv_ratio,
            request.loan_type.value
        )

        # Generate quote ID and timestamps
        quote_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat()

        quote = QuoteResponse(
            quote_id=quote_id,
            loan_amount=request.loan_amount,
            property_value=request.property_value,
            down_payment=actual_down_payment,
            ltv_ratio=round(ltv_ratio, 2),
            interest_rate=interest_rate,
            monthly_payment=round(total_monthly, 2),
            principal_and_interest=principal_and_interest,
            pmi_monthly=pmi_monthly,
            estimated_taxes=estimated_taxes,
            estimated_insurance=estimated_insurance,
            total_monthly_payment=round(total_monthly, 2),
            closing_costs=closing_costs,
            apr=apr,
            approval_likelihood=approval_likelihood,
            approval_confidence=approval_confidence,
            created_at=created_at,
            expires_at=expires_at
        )

        logger.info(f"Quote {quote_id} generated successfully")
        return quote

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating quote: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error generating quote")

@app.get("/rates", response_model=list[RateInfo])
async def get_current_rates():
    """Get current base rates for all loan types"""
    rates = []
    as_of_date = datetime.utcnow().isoformat()

    for (loan_type, term), base_rate in BASE_RATES.items():
        rates.append(RateInfo(
            loan_type=loan_type,
            term_years=term,
            base_rate=base_rate,
            as_of_date=as_of_date
        ))

    return rates

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "quote-engine",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
