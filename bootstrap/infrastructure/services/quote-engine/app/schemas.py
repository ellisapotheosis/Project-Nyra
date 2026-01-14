from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class QuoteOption(BaseModel):
    program: str = Field(..., examples=["30YR FIXED", "15YR FIXED", "ARM 7/6"])
    rate: float = Field(..., ge=0, le=30, description="Note rate in percent, e.g. 6.5")
    points: float = Field(0.0, ge=0, le=10, description="Discount points percentage, e.g. 1.25")
    lender: Optional[str] = None

class QuoteRequest(BaseModel):
    purpose: Literal["purchase","refi"] = "purchase"
    term_years: int = Field(30, ge=5, le=40)
    loan_amount: float = Field(..., gt=0)
    property_value: float = Field(..., gt=0)
    purchase_price: Optional[float] = Field(None, gt=0)
    credit_score: Optional[int] = Field(None, ge=300, le=850)
    hoa_monthly: float = Field(0.0, ge=0)
    tax_annual_rate: float = Field(0.0125, ge=0, le=0.05)
    insurance_annual_rate: float = Field(0.0035, ge=0, le=0.05)
    options: List[QuoteOption] = Field(..., min_length=1)

class QuoteOptionResult(BaseModel):
    program: str
    lender: Optional[str]
    rate: float
    points: float
    principal_interest: float
    taxes: float
    insurance: float
    mi: float
    hoa: float
    payment_total: float
    cash_to_close_est: float

class QuoteResponse(BaseModel):
    currency: str = "USD"
    results: List[QuoteOptionResult]
