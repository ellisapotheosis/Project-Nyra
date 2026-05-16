from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Literal, Optional, List

from pydantic import BaseModel, Field, model_validator


Compounding = Literal["Monthly", "Semi-Annually"]
PaymentFrequency = Literal[
    "Monthly",
    "Semi-Monthly",
    "Bi-Weekly",
    "Weekly",
    "Acc Bi-Weekly",
    "Acc Weekly",
]


class ExtraPayment(BaseModel):
    """An optional extra principal payment applied each period."""

    amount: float = Field(0.0, ge=0)


class QuoteRequest(BaseModel):
    loan_amount: float = Field(..., gt=0, description="Principal (PV).")
    annual_interest_rate: float = Field(
        ...,
        ge=0,
        description="Nominal APR as decimal (e.g., 0.0706 for 7.06%).",
    )
    term_years: int = Field(..., ge=1, le=50)

    start_date: date = Field(..., description="First payment start date.")

    compounding: Compounding = "Monthly"
    payment_frequency: PaymentFrequency = "Monthly"

    # Optional additions for full PITI-style quoting
    annual_property_tax: float = Field(0.0, ge=0)
    annual_home_insurance: float = Field(0.0, ge=0)
    monthly_hoa: float = Field(0.0, ge=0)
    monthly_pmi: float = Field(0.0, ge=0)

    extra: ExtraPayment = Field(default_factory=ExtraPayment)

    # If True, return a full amortization table
    include_schedule: bool = False


class QuoteSummary(BaseModel):
    periodic_payment_pi: float
    periodic_interest_rate: float
    periods_per_year: int
    number_of_payments: int

    total_interest: float
    total_paid: float

    payoff_date: date

    # Optional, if you included tax/ins/hoa/pmi
    periodic_payment_piti: float


class AmortizationRow(BaseModel):
    period: int
    date: date
    payment: float
    principal: float
    interest: float
    extra_principal: float
    balance: float


class QuoteResponse(BaseModel):
    inputs: QuoteRequest
    summary: QuoteSummary
    schedule: Optional[List[AmortizationRow]] = None


class CompareRequest(BaseModel):
    scenarios: List[QuoteRequest]


class CompareResponse(BaseModel):
    results: List[QuoteResponse]


class CanonicalMoney(BaseModel):
    amountCents: int
    currency: str = Field("USD", min_length=3, max_length=3)


class CanonicalLoanScenario(BaseModel):
    purpose: Literal["PURCHASE", "REFI_RATE", "REFI_CASH", "HELOC"]
    loanAmount: CanonicalMoney
    propertyValue: Optional[CanonicalMoney] = None
    downPayment: Optional[CanonicalMoney] = None
    state: str = Field(..., min_length=2, max_length=2)
    occupancy: Literal["PRIMARY", "SECOND_HOME", "INVESTMENT"]
    loanType: Optional[Literal["CONVENTIONAL", "FHA", "VA", "USDA", "JUMBO", "HELOC"]] = None
    creditScore: Optional[int] = Field(None, ge=300, le=850)
    annualTaxes: Optional[CanonicalMoney] = None
    annualInsurance: Optional[CanonicalMoney] = None
    monthlyHoa: Optional[CanonicalMoney] = None
    pmiRateBps: Optional[int] = Field(None, ge=0, le=300)

    @model_validator(mode="after")
    def validate_property_equity(self):
        if self.propertyValue and self.downPayment:
            if self.downPayment.amountCents >= self.propertyValue.amountCents:
                raise ValueError("downPayment.amountCents must be less than propertyValue.amountCents")
        return self


class CanonicalQuoteRequest(BaseModel):
    leadId: str
    loanScenario: CanonicalLoanScenario
    requestedBy: str
    requestedAt: str
    baseRate: Optional[float] = Field(None, ge=0, description="Base note rate as a percent, e.g. 6.75")
    termYears: int = Field(30, ge=1, le=50)


class CanonicalPricingScenario(BaseModel):
    id: Optional[str] = None
    kind: Literal["LOWEST_PAYMENT", "BALANCED", "LOWEST_COST"]
    label: str
    rate: float = Field(..., ge=0)
    apr: float = Field(..., ge=0)
    points: float = 0
    monthlyPayment: CanonicalMoney
    cashToClose: CanonicalMoney
    closingCosts: CanonicalMoney
    breakEvenMonths: Optional[float] = Field(None, ge=0)
    assumptions: List[str] = Field(default_factory=list)
    calculationTrace: dict = Field(default_factory=dict)


class CanonicalQuoteResponse(BaseModel):
    id: Optional[str] = None
    leadId: str
    loanScenarioId: Optional[str] = None
    status: Literal["DRAFT", "READY", "APPROVED", "SENT", "EXPIRED"] = "READY"
    options: List[CanonicalPricingScenario] = Field(..., min_length=3, max_length=3)
    selectedOptionId: Optional[str] = None
    expiresAt: Optional[str] = None
    createdAt: Optional[str] = None


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
