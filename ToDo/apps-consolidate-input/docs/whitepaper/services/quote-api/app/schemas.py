from pydantic import BaseModel, Field
from typing import List, Optional

class LoanScenario(BaseModel):
    credit_score: int = Field(..., ge=300, le=850)
    loan_amount: float = Field(..., gt=0)
    property_value: float = Field(..., gt=0)
    loan_purpose: str
    occupancy: str
    state: Optional[str] = None

class QuoteRequest(BaseModel):
    scenario: LoanScenario
    borrower_name: Optional[str] = None

class QuoteOption(BaseModel):
    program: str
    rate: float
    apr: Optional[float] = None
    points: Optional[float] = None
    payment: Optional[float] = None
    notes: Optional[str] = None

class QuoteResponse(BaseModel):
    summary: str
    options: List[QuoteOption]
