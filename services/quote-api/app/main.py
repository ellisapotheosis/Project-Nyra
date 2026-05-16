"""
Nyra Quote API - Main Entry Point
Supports: Conventional, FHA, VA, and USDA loans with PDF generation.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from .models import (
    CanonicalMoney,
    CanonicalPricingScenario,
    CanonicalQuoteRequest,
    CanonicalQuoteResponse,
    QuoteRequest,
    QuoteResponse,
    CompareRequest,
    CompareResponse,
    utc_now_iso,
)
from .calc import amortization
from .loan_types import (
    LoanTypeRequest,
    LoanTypeQuoteResponse,
    validate_loan_type_request,
    LoanType,
)
from .loan_calc import calculate_loan_type_quote
from .pdf_gen import generate_quote_pdf

app = FastAPI(
    title="Nyra Quote API",
    version="2.1.0",
    description="Mortgage quote API with support for Conventional, FHA, VA, and USDA loans + PDF generation",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"ok": True, "version": "2.1.0", "service": "nyra-quote-api"}


@app.get("/")
def root():
    """API information."""
    return {
        "service": "Nyra Quote API",
        "version": "2.1.0",
        "endpoints": {
            "health": "/health",
            "canonical_generate": "/api/quotes/generate",
            "canonical_v1": "/api/v1/quote",
            "generic_quote": "/quote",
            "compare": "/quote/compare",
            "conventional": "/quote/conventional",
            "fha": "/quote/fha",
            "va": "/quote/va",
            "usda": "/quote/usda",
            "loan_types": "/quote/loan-types",
        },
        "docs": "/docs",
    }


def _payment_cents(principal_cents: int, rate_percent: float, years: int = 30) -> int:
    principal = principal_cents / 100
    monthly_rate = rate_percent / 100 / 12
    months = years * 12
    if abs(monthly_rate) < 1e-12:
        return round((principal / months) * 100)
    payment = (
        principal
        * monthly_rate
        * pow(1 + monthly_rate, months)
        / (pow(1 + monthly_rate, months) - 1)
    )
    return round(payment * 100)


OPTION_CONFIGS = [
    {
        "kind": "LOWEST_PAYMENT",
        "label": "Buy-down",
        "rate_adjustment": -0.375,
        "points": 1.0,
        "assumption": "Borrower pays one discount point to reduce monthly principal and interest.",
    },
    {
        "kind": "BALANCED",
        "label": "Standard par",
        "rate_adjustment": 0.0,
        "points": 0.0,
        "assumption": "Par pricing with no discount points or lender credit.",
    },
    {
        "kind": "LOWEST_COST",
        "label": "Lender credit",
        "rate_adjustment": 0.375,
        "points": -0.75,
        "assumption": "Lender credit reduces estimated cash to close in exchange for a higher note rate.",
    },
]


def _money_amount_cents(value: Optional[CanonicalMoney]) -> int:
    return value.amountCents if value else 0


def _ltv_percent(principal_cents: int, property_value_cents: int) -> float:
    if property_value_cents <= 0:
        return 100.0
    return round(principal_cents / property_value_cents * 100, 3)


def _monthly_pmi_cents(req: CanonicalQuoteRequest, principal_cents: int, property_value_cents: int) -> int:
    loan_type = req.loanScenario.loanType or "CONVENTIONAL"
    if loan_type in {"VA", "USDA", "HELOC"}:
        return 0
    if property_value_cents <= 0 or principal_cents / property_value_cents <= 0.8:
        return 0
    annual_rate = (req.loanScenario.pmiRateBps if req.loanScenario.pmiRateBps is not None else 55) / 10000
    return round(principal_cents * annual_rate / 12)


def _expires_at_iso(hours: int = 24) -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat().replace("+00:00", "Z")


def _pricing_option(
    kind: str,
    label: str,
    principal_cents: int,
    property_value_cents: int,
    down_payment_cents: int,
    annual_taxes_cents: int,
    annual_insurance_cents: int,
    monthly_hoa_cents: int,
    monthly_pmi_cents: int,
    rate: float,
    points: float,
    term_years: int,
    assumption: str,
) -> CanonicalPricingScenario:
    closing_costs = round(principal_cents * 0.0225)
    points_cost = round(principal_cents * points / 100)
    principal_interest_cents = _payment_cents(principal_cents, rate, term_years)
    monthly_taxes_cents = round(annual_taxes_cents / 12)
    monthly_insurance_cents = round(annual_insurance_cents / 12)
    monthly_payment_cents = (
        principal_interest_cents
        + monthly_taxes_cents
        + monthly_insurance_cents
        + monthly_hoa_cents
        + monthly_pmi_cents
    )
    cash_to_close_cents = max(0, down_payment_cents + closing_costs + points_cost)
    return CanonicalPricingScenario(
        id=kind.lower().replace("_", "-"),
        kind=kind,
        label=label,
        rate=rate,
        apr=round(rate + 0.18 + points * 0.04, 3),
        points=points,
        monthlyPayment=CanonicalMoney(
            amountCents=monthly_payment_cents,
            currency="USD",
        ),
        cashToClose=CanonicalMoney(
            amountCents=cash_to_close_cents,
            currency="USD",
        ),
        closingCosts=CanonicalMoney(amountCents=closing_costs, currency="USD"),
        assumptions=[
            f"{term_years}-year fixed baseline",
            "Illustrative pricing until live rate sheets are configured",
            "Estimates are subject to broker review and final lender disclosures.",
            assumption,
        ],
        calculationTrace={
            "engine": "nyra-quote-api",
            "version": "2.1.0",
            "principalCents": principal_cents,
            "propertyValueCents": property_value_cents,
            "ltvPercent": _ltv_percent(principal_cents, property_value_cents),
            "principalInterestCents": principal_interest_cents,
            "monthlyTaxesCents": monthly_taxes_cents,
            "monthlyInsuranceCents": monthly_insurance_cents,
            "monthlyHoaCents": monthly_hoa_cents,
            "monthlyPmiCents": monthly_pmi_cents,
            "pointsCostCents": points_cost,
            "downPaymentCents": down_payment_cents,
            "cashToCloseCents": cash_to_close_cents,
        },
    )


def _generate_canonical_quote(req: CanonicalQuoteRequest):
    principal_cents = req.loanScenario.loanAmount.amountCents
    if principal_cents <= 0:
        raise HTTPException(status_code=400, detail="loanAmount.amountCents must be positive")
    property_value_cents = _money_amount_cents(req.loanScenario.propertyValue)
    down_payment_cents = _money_amount_cents(req.loanScenario.downPayment)
    base_rate = req.baseRate if req.baseRate is not None else 6.75
    monthly_pmi_cents = _monthly_pmi_cents(req, principal_cents, property_value_cents)

    return CanonicalQuoteResponse(
        id=f"quote_{req.leadId}",
        leadId=req.leadId,
        status="READY",
        options=[
            _pricing_option(
                config["kind"],
                config["label"],
                principal_cents,
                property_value_cents,
                down_payment_cents,
                _money_amount_cents(req.loanScenario.annualTaxes),
                _money_amount_cents(req.loanScenario.annualInsurance),
                _money_amount_cents(req.loanScenario.monthlyHoa),
                monthly_pmi_cents,
                round(base_rate + config["rate_adjustment"], 3),
                config["points"],
                req.termYears,
                config["assumption"],
            )
            for config in OPTION_CONFIGS
        ],
        createdAt=utc_now_iso(),
        expiresAt=_expires_at_iso(),
    )


@app.post("/api/quotes/generate", response_model=CanonicalQuoteResponse)
def generate_canonical_quote(req: CanonicalQuoteRequest):
    """
    Generate the canonical Project Nyra three-option quote shape.
    """
    return _generate_canonical_quote(req)


@app.post("/api/v1/quote", response_model=CanonicalQuoteResponse)
def generate_canonical_quote_v1(req: CanonicalQuoteRequest):
    """
    Versioned canonical quote endpoint for service-to-service integrations.
    """
    return _generate_canonical_quote(req)

# ============================================================================
# LOAN-TYPE-SPECIFIC ENDPOINTS
# ============================================================================

@app.post("/quote/{loan_type}", response_model=LoanTypeQuoteResponse)
def quote_specific(loan_type: LoanType, req: LoanTypeRequest):
    """
    Get quote for a specific loan type.
    """
    req.loan_type = loan_type

    # Validate
    is_valid, error_msg = validate_loan_type_request(req)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Calculate
    summary, schedule = calculate_loan_type_quote(req)

    return LoanTypeQuoteResponse(
        quote_id=summary.quote_id,
        inputs=req,
        summary=summary,
        schedule=schedule if req.include_schedule else None,
        assumptions=summary.assumptions,
    )

@app.post("/quote/{loan_type}/price")
def price_quote(loan_type: LoanType, req: LoanTypeRequest):
    """
    Generate a quote using internal rate sheets and LLPAs.
    """
    from .rates import get_adjusted_rate

    # Calculate adjusted rate
    req.annual_interest_rate = get_adjusted_rate(
        loan_type, req.term_years, req.credit_score, req.ltv
    )

    return quote_specific(loan_type, req)

@app.post("/quote/{loan_type}/pdf")
def quote_pdf(loan_type: LoanType, req: LoanTypeRequest):
    """
    Generate a PDF quote for a specific loan type.
    """
    req.loan_type = loan_type

    # Validate
    is_valid, error_msg = validate_loan_type_request(req)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Calculate
    summary, _ = calculate_loan_type_quote(req)

    # Generate PDF
    pdf_bytes = generate_quote_pdf(summary)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=quote_{summary.quote_id}.pdf"
        }
    )

@app.post("/quote/compare-loan-types")
def compare_loan_types(base_request: LoanTypeRequest):
    """
    Compare all loan types for the same property/borrower.
    """
    results = {}
    loan_types: List[LoanType] = ["conventional", "fha", "va", "usda"]

    for loan_type in loan_types:
        try:
            req_copy = base_request.model_copy(deep=True)
            req_copy.loan_type = loan_type

            is_valid, error_msg = validate_loan_type_request(req_copy)
            if not is_valid:
                results[loan_type] = {"error": error_msg, "available": False}
                continue

            summary, _ = calculate_loan_type_quote(req_copy)

            results[loan_type] = {
                "available": True,
                "quote_id": summary.quote_id,
                "monthly_payment": summary.periodic_payment_piti,
                "total_paid": summary.total_paid,
                "upfront_fees": summary.upfront_fees,
                "financed_amount": summary.financed_amount,
                "summary": summary.model_dump(),
            }

        except Exception as e:
            results[loan_type] = {"error": str(e), "available": False}

    return {
        "comparison": results,
        "property_value": base_request.property_value,
        "loan_amount": base_request.loan_amount,
        "credit_score": base_request.credit_score,
    }

# ============================================================================
# GENERIC QUOTE ENDPOINTS (backward compatible)
# ============================================================================

@app.post("/quote", response_model=QuoteResponse)
def quote_generic(req: QuoteRequest):
    """Generic quote endpoint."""
    summary, rows = amortization(req)
    return QuoteResponse(
        inputs=req,
        summary=summary,
        schedule=rows if req.include_schedule else None,
    )
