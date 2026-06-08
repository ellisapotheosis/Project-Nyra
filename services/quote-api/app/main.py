"""
Nyra Quote API - Main Entry Point
Supports: Conventional, FHA, VA, and USDA loans with PDF generation.
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException, Response
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from .models import QuoteRequest, QuoteResponse, CompareRequest, CompareResponse
from .calc import amortization
from .loan_types import (
    LoanTypeRequest,
    LoanTypeQuoteResponse,
    validate_loan_type_request,
    LoanType,
)
from .loan_calc import calculate_loan_type_quote
from .pdf_gen import generate_quote_pdf

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Nyra Quote API",
    version="2.1.0",
    description="Mortgage quote API with support for Conventional, FHA, VA, and USDA loans + PDF generation",
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "details": jsonable_encoder(exc.errors()),
            "body": exc.body
        },
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
        loan_type,
        req.term_years,
        req.credit_score,
        req.ltv,
        loan_purpose=getattr(req, "loan_purpose", "PURCHASE"),
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
