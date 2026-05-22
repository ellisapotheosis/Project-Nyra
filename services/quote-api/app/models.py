from __future__ import annotations

from datetime import date
from typing import Literal, Optional, List

from pydantic import BaseModel, Field, field_validator


MAX_REASONABLE_ANNUAL_RATE = 0.25


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
        gt=0,
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

    @field_validator("annual_interest_rate")
    @classmethod
    def annual_interest_rate_must_be_decimal(cls, value: float) -> float:
        if value > MAX_REASONABLE_ANNUAL_RATE:
            raise ValueError(
                "annual_interest_rate must be a decimal rate <= 0.25; use 0.07, not 7"
            )

        return value


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
