from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import math
from typing import Optional
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nyra Quote Engine", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class QuoteRequest(BaseModel):
    loan_amount: float = Field(..., gt=0)
    property_value: float = Field(..., gt=0)
    credit_score: int = Field(..., ge=300, le=850)
    loan_type: str
    loan_term: int
    down_payment: float = Field(..., ge=0)
    property_state: str
    property_zip: str
    borrower_email: str

class QuoteResponse(BaseModel):
    quote_id: str
    interest_rate: float
    monthly_payment: float
    total_interest: float
    apr: float
    closing_costs: float
    pmi_required: bool
    pmi_amount: Optional[float]
    loan_to_value: float
    debt_to_income_max: float
    approval_likelihood: str
    generated_at: datetime
    total_monthly_payment: float

def calculate_interest_rate(credit_score: int, loan_type: str, ltv: float) -> float:
    base_rates = {"conventional": 6.875, "fha": 6.625, "va": 6.375, "jumbo": 7.125}
    rate = base_rates.get(loan_type.lower(), 7.0)
    if credit_score >= 760: rate -= 0.75
    elif credit_score >= 700: rate -= 0.5
    elif credit_score >= 680: rate -= 0.25
    elif credit_score < 620: rate += 0.5
    if ltv > 80: rate += 0.25
    if ltv > 90: rate += 0.5
    return round(rate, 3)

def calculate_monthly_payment(principal: float, annual_rate: float, years: int) -> float:
    monthly_rate = annual_rate / 100 / 12
    num_payments = years * 12
    if monthly_rate == 0: return principal / num_payments
    payment = principal * (monthly_rate * math.pow(1 + monthly_rate, num_payments)) / (math.pow(1 + monthly_rate, num_payments) - 1)
    return round(payment, 2)

def calculate_pmi(loan_amount: float, ltv: float) -> Optional[float]:
    if ltv <= 80: return None
    pmi_rate = 0.005
    return round((loan_amount * pmi_rate) / 12, 2)

@app.post("/quote", response_model=QuoteResponse)
async def generate_quote(request: QuoteRequest):
    ltv = (request.loan_amount / request.property_value) * 100
    interest_rate = calculate_interest_rate(request.credit_score, request.loan_type, ltv)
    monthly_payment = calculate_monthly_payment(request.loan_amount, interest_rate, request.loan_term)
    pmi_amount = calculate_pmi(request.loan_amount, ltv)
    total_monthly = monthly_payment + (pmi_amount or 0)
    total_interest = (monthly_payment * request.loan_term * 12) - request.loan_amount
    closing_costs = request.loan_amount * 0.03
    apr = interest_rate + 0.125
    approval = "Excellent" if request.credit_score >= 740 and ltv <= 80 else "Good" if request.credit_score >= 680 else "Fair"
    quote_id = f"Q{datetime.now().strftime('%Y%m%d%H%M%S')}"
    return QuoteResponse(quote_id=quote_id, interest_rate=interest_rate, monthly_payment=monthly_payment, 
                        total_interest=total_interest, apr=apr, closing_costs=closing_costs,
                        pmi_required=pmi_amount is not None, pmi_amount=pmi_amount, loan_to_value=ltv,
                        debt_to_income_max=43.0, approval_likelihood=approval, generated_at=datetime.now(),
                        total_monthly_payment=total_monthly)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "quote-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
