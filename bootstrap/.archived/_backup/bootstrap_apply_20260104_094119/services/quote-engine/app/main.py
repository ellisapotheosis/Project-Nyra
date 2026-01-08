from __future__ import annotations

from fastapi import FastAPI
from .schemas import QuoteRequest, QuoteResponse, QuoteOptionResult
from .mortgage_math import (
    monthly_pi,
    estimate_tax_monthly,
    estimate_insurance_monthly,
    estimate_mi_monthly,
    estimate_cash_to_close,
)

app = FastAPI(title="Nyra Quote Engine", version="0.1.0")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/v1/quotes/soft", response_model=QuoteResponse)
def soft_quote(req: QuoteRequest) -> QuoteResponse:
    tax_m = estimate_tax_monthly(req.property_value, req.tax_annual_rate)
    ins_m = estimate_insurance_monthly(req.property_value, req.insurance_annual_rate)

    results = []
    for opt in req.options:
        pi = monthly_pi(req.loan_amount, opt.rate, req.term_years)
        mi = estimate_mi_monthly(req.loan_amount, req.property_value, req.credit_score)
        cash = estimate_cash_to_close(
            loan_amount=req.loan_amount,
            purchase_price=req.purchase_price if req.purpose == "purchase" else None,
            points=opt.points,
            tax_monthly=tax_m,
            ins_monthly=ins_m,
        )
        total = pi + tax_m + ins_m + mi + req.hoa_monthly
        results.append(QuoteOptionResult(
            program=opt.program,
            lender=opt.lender,
            rate=opt.rate,
            points=opt.points,
            principal_interest=round(pi, 2),
            taxes=round(tax_m, 2),
            insurance=round(ins_m, 2),
            mi=round(mi, 2),
            hoa=round(req.hoa_monthly, 2),
            payment_total=round(total, 2),
            cash_to_close_est=round(cash, 2),
        ))
    # sort by payment
    results.sort(key=lambda r: (r.payment_total, r.points))
    return QuoteResponse(results=results)
