"""
Enhanced Nyra Quote API with loan-type-specific endpoints.

Supports: Conventional, FHA, VA, and USDA loans.
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from .models import QuoteRequest, QuoteResponse, CompareRequest, CompareResponse
from .calc import amortization
from .loan_types import (
    LoanTypeRequest,
    LoanTypeQuoteResponse,
    validate_loan_type_request,
    LoanType,
)
from .loan_calc import calculate_loan_type_quote

app = FastAPI(
    title="Nyra Quote API",
    version="2.0.0",
    description="Mortgage quote API with support for Conventional, FHA, VA, and USDA loans",
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
    return {"ok": True, "version": "2.0.0", "service": "nyra-quote-api"}


@app.get("/")
def root():
    """API information."""
    return {
        "service": "Nyra Quote API",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
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


@app.get("/quote/loan-types")
def get_loan_types():
    """Get available loan types and their characteristics."""
    return {
        "loan_types": [
            {
                "type": "conventional",
                "name": "Conventional Loan",
                "description": "Standard conforming loan with PMI if LTV > 80%",
                "min_down_payment": "3%",
                "max_ltv": "97%",
                "min_credit_score": 620,
                "pmi_required": "Yes, if LTV > 80%",
            },
            {
                "type": "fha",
                "name": "FHA Loan",
                "description": "Government-insured loan with lower down payment",
                "min_down_payment": "3.5%",
                "max_ltv": "96.5%",
                "min_credit_score": 580,
                "mortgage_insurance": "1.75% upfront MIP + 0.55% annual MIP",
            },
            {
                "type": "va",
                "name": "VA Loan",
                "description": "Veterans Affairs loan with no down payment",
                "min_down_payment": "0%",
                "max_ltv": "100%",
                "min_credit_score": 620,
                "funding_fee": "2.18% (can be financed)",
            },
            {
                "type": "usda",
                "name": "USDA Loan",
                "description": "Rural development loan with no down payment",
                "min_down_payment": "0%",
                "max_ltv": "100%",
                "min_credit_score": 640,
                "guarantee_fee": "1% upfront + 0.35% annual",
            },
        ]
    }


# ============================================================================
# GENERIC QUOTE ENDPOINTS (backward compatible)
# ============================================================================

@app.post("/quote", response_model=QuoteResponse)
def quote(req: QuoteRequest):
    """
    Generic quote endpoint (original implementation).

    For loan-type-specific quotes with assumptions, use:
    - /quote/conventional
    - /quote/fha
    - /quote/va
    - /quote/usda
    """
    summary, rows = amortization(req)
    return QuoteResponse(
        inputs=req,
        summary=summary,
        schedule=rows if req.include_schedule else None,
    )


@app.post("/quote/compare", response_model=CompareResponse)
def compare(req: CompareRequest):
    """Compare multiple generic quote scenarios."""
    results = []
    for scenario in req.scenarios:
        summary, rows = amortization(scenario)
        results.append(
            QuoteResponse(
                inputs=scenario,
                summary=summary,
                schedule=rows if scenario.include_schedule else None,
            )
        )
    return CompareResponse(results=results)


# ============================================================================
# LOAN-TYPE-SPECIFIC ENDPOINTS
# ============================================================================

@app.post("/quote/conventional", response_model=LoanTypeQuoteResponse)
def quote_conventional(req: LoanTypeRequest):
    """
    Get quote for Conventional loan.

    - PMI required if LTV > 80%
    - PMI cancels at 78% LTV
    - Conforming loan limits apply
    - Minimum 3% down payment
    """
    # Force loan type
    req.loan_type = "conventional"

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


@app.post("/quote/fha", response_model=LoanTypeQuoteResponse)
def quote_fha(req: LoanTypeRequest):
    """
    Get quote for FHA loan.

    - 1.75% upfront MIP (can be financed)
    - 0.55% annual MIP (average for >15yr, >95% LTV)
    - Minimum 3.5% down payment (580+ credit score)
    - 10% down for 500-579 credit score
    - FHA loan limits apply
    """
    # Force loan type
    req.loan_type = "fha"

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


@app.post("/quote/va", response_model=LoanTypeQuoteResponse)
def quote_va(req: LoanTypeRequest):
    """
    Get quote for VA loan.

    - 2.18% funding fee (first-time use, 0% down)
    - Funding fee can be financed
    - No PMI required
    - No down payment required
    - No loan limits for 0% down with full entitlement
    """
    # Force loan type
    req.loan_type = "va"

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


@app.post("/quote/usda", response_model=LoanTypeQuoteResponse)
def quote_usda(req: LoanTypeRequest):
    """
    Get quote for USDA loan.

    - 1% upfront guarantee fee (can be financed)
    - 0.35% annual fee
    - No down payment required
    - Property must be in eligible rural area
    - Income limits apply (not validated by this API)
    """
    # Force loan type
    req.loan_type = "usda"

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


@app.post("/quote/compare-loan-types")
def compare_loan_types(base_request: LoanTypeRequest):
    """
    Compare all loan types for the same property/borrower.

    Returns quotes for Conventional, FHA, VA, and USDA based on the same inputs.
    """
    results = {}
    loan_types: List[LoanType] = ["conventional", "fha", "va", "usda"]

    for loan_type in loan_types:
        try:
            # Create copy of request with specific loan type
            req_copy = base_request.model_copy(deep=True)
            req_copy.loan_type = loan_type

            # Validate
            is_valid, error_msg = validate_loan_type_request(req_copy)
            if not is_valid:
                results[loan_type] = {
                    "error": error_msg,
                    "available": False,
                }
                continue

            # Calculate
            summary, schedule = calculate_loan_type_quote(req_copy)

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
            results[loan_type] = {
                "error": str(e),
                "available": False,
            }

    return {
        "comparison": results,
        "property_value": base_request.property_value,
        "loan_amount": base_request.loan_amount,
        "credit_score": base_request.credit_score,
    }
