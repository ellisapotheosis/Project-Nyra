"""
Loan-type-specific models and assumptions for Conventional, FHA, VA, and USDA loans.
"""
from __future__ import annotations

from typing import Literal, Optional, Dict, Any
from pydantic import BaseModel, Field, computed_field
from datetime import date
import uuid

LoanType = Literal["conventional", "fha", "va", "usda"]


class LoanAssumptions(BaseModel):
    """Base assumptions for all loan types."""

    loan_type: LoanType
    requires_pmi: bool = False
    upfront_fee_rate: float = 0.0
    annual_insurance_rate: float = 0.0
    max_ltv: float = 1.0
    min_credit_score: int = 620
    funding_fee_rate: float = 0.0
    can_finance_upfront_fee: bool = False


class ConventionalAssumptions(LoanAssumptions):
    """Conventional loan assumptions (conforming loans)."""

    loan_type: Literal["conventional"] = "conventional"
    requires_pmi: bool = True  # If LTV > 80%
    max_ltv: float = 0.97  # 3% down
    min_credit_score: int = 620
    pmi_cancellation_ltv: float = 0.78  # PMI cancels at 78% LTV
    conforming_limit_2024: float = 766550.0


class FHAAssumptions(LoanAssumptions):
    """FHA loan assumptions."""

    loan_type: Literal["fha"] = "fha"
    upfront_fee_rate: float = 0.0175  # 1.75% upfront MIP
    annual_insurance_rate: float = 0.0055  # 0.55% annual MIP (avg for > 15yr, > 95% LTV)
    max_ltv: float = 0.965  # 3.5% down
    min_credit_score: int = 580  # 500-579 requires 10% down
    can_finance_upfront_fee: bool = True
    fha_loan_limit_2024: float = 498257.0


class VAAssumptions(LoanAssumptions):
    """VA loan assumptions."""

    loan_type: Literal["va"] = "va"
    funding_fee_rate: float = 0.0218  # 2.18% for first-time use, 0% down
    # Note: rates vary by down payment and usage (first-time vs subsequent)
    max_ltv: float = 1.0  # 0% down
    min_credit_score: int = 620  # Lender overlays; VA has no minimum
    can_finance_upfront_fee: bool = True
    requires_pmi: bool = False
    va_loan_limit_2024: float = 766550.0  # No limit for 0 down if entitlement


class USDAAssumptions(LoanAssumptions):
    """USDA loan assumptions."""

    loan_type: Literal["usda"] = "usda"
    upfront_fee_rate: float = 0.01  # 1% upfront guarantee fee
    annual_insurance_rate: float = 0.0035  # 0.35% annual fee
    max_ltv: float = 1.0  # 0% down
    min_credit_score: int = 640
    can_finance_upfront_fee: bool = True
    requires_pmi: bool = False


class LoanTypeRequest(BaseModel):
    """Enhanced quote request with loan-type-specific fields."""

    # Core loan details
    loan_amount: float = Field(..., gt=0, description="Base loan amount before any fees.")
    property_value: float = Field(..., gt=0, description="Property appraised value.")
    annual_interest_rate: float = Field(..., gt=0, description="Nominal APR as decimal.")
    term_years: int = Field(..., ge=10, le=50)
    start_date: date = Field(..., description="First payment date.")

    # Loan type
    loan_type: LoanType

    # Borrower details
    credit_score: int = Field(..., ge=300, le=850)
    down_payment: float = Field(0.0, ge=0, description="Down payment amount (not percentage).")

    # Optional payment details
    compounding: Literal["Monthly", "Semi-Annually"] = "Monthly"
    payment_frequency: Literal["Monthly", "Semi-Monthly", "Bi-Weekly", "Weekly"] = "Monthly"

    # Additional costs
    annual_property_tax: float = Field(0.0, ge=0)
    annual_home_insurance: float = Field(0.0, ge=0)
    monthly_hoa: float = Field(0.0, ge=0)

    # Extra payments
    extra_principal: float = Field(0.0, ge=0)

    # Output options
    include_schedule: bool = False

    @computed_field
    @property
    def ltv(self) -> float:
        """Loan-to-value ratio."""
        return (self.loan_amount + self.down_payment) / self.property_value if self.property_value > 0 else 0.0

    @computed_field
    @property
    def down_payment_percent(self) -> float:
        """Down payment as percentage."""
        return (self.down_payment / self.property_value * 100) if self.property_value > 0 else 0.0


class LoanTypeQuoteSummary(BaseModel):
    """Enhanced summary with loan-type details."""

    quote_id: str
    loan_type: LoanType

    # Loan amounts
    base_loan_amount: float
    upfront_fees: float
    financed_amount: float

    # Payment details
    periodic_payment_pi: float
    monthly_pmi_or_mip: float
    periodic_payment_piti: float

    # Rates and terms
    periodic_interest_rate: float
    annual_interest_rate: float
    periods_per_year: int
    number_of_payments: int
    term_years: int

    # Totals
    total_interest: float
    total_pmi_or_mip: float
    total_paid: float
    payoff_date: date

    # Loan details
    ltv: float
    down_payment: float
    property_value: float
    credit_score: int

    # Assumptions used
    assumptions: Dict[str, Any]


class LoanTypeQuoteResponse(BaseModel):
    """Response for loan-type-specific quotes."""

    quote_id: str
    inputs: LoanTypeRequest
    summary: LoanTypeQuoteSummary
    schedule: Optional[list] = None
    assumptions: Dict[str, Any]


def get_loan_assumptions(loan_type: LoanType) -> LoanAssumptions:
    """Factory function to get loan assumptions by type."""

    assumptions_map = {
        "conventional": ConventionalAssumptions(),
        "fha": FHAAssumptions(),
        "va": VAAssumptions(),
        "usda": USDAAssumptions(),
    }

    return assumptions_map[loan_type]


def calculate_upfront_fees(req: LoanTypeRequest, assumptions: LoanAssumptions) -> float:
    """Calculate upfront fees (MIP, funding fee, etc.)."""

    if assumptions.upfront_fee_rate > 0:
        if assumptions.can_finance_upfront_fee:
            # Fee is based on base loan amount
            return req.loan_amount * assumptions.upfront_fee_rate
        else:
            # Fee must be paid upfront (not financed)
            return req.loan_amount * assumptions.upfront_fee_rate

    if assumptions.funding_fee_rate > 0:
        # VA funding fee
        return req.loan_amount * assumptions.funding_fee_rate

    return 0.0


def calculate_monthly_insurance(req: LoanTypeRequest, assumptions: LoanAssumptions, current_balance: float) -> float:
    """Calculate monthly PMI/MIP based on loan type and balance."""

    ltv = req.ltv

    # Conventional PMI
    if req.loan_type == "conventional":
        if ltv > 0.80:
            # PMI rate varies by LTV and credit score
            # Simplified: 0.5% - 1.0% annually
            if ltv >= 0.95:
                pmi_rate = 0.01
            elif ltv >= 0.90:
                pmi_rate = 0.008
            elif ltv >= 0.85:
                pmi_rate = 0.006
            else:
                pmi_rate = 0.005

            # Check if we can cancel PMI (78% LTV)
            current_ltv = current_balance / req.property_value
            if current_ltv <= 0.78:
                return 0.0

            return (req.loan_amount * pmi_rate) / 12
        return 0.0

    # FHA MIP
    if req.loan_type == "fha":
        # Annual MIP varies by loan amount, LTV, and term
        annual_rate = assumptions.annual_insurance_rate
        if req.term_years <= 15 and ltv <= 0.90:
            annual_rate = 0.0045
        return (req.loan_amount * annual_rate) / 12

    # VA and USDA have no monthly insurance
    if req.loan_type == "va":
        return 0.0

    # USDA annual fee
    if req.loan_type == "usda":
        return (req.loan_amount * assumptions.annual_insurance_rate) / 12

    return 0.0


def validate_loan_type_request(req: LoanTypeRequest) -> tuple[bool, Optional[str]]:
    """Validate loan request against loan-type rules."""

    assumptions = get_loan_assumptions(req.loan_type)
    ltv = req.ltv

    # Check LTV limits
    if ltv > assumptions.max_ltv:
        return False, f"{req.loan_type.upper()} loans require at least {(1-assumptions.max_ltv)*100:.1f}% down payment. Current LTV: {ltv*100:.1f}%"

    # Check credit score
    if req.credit_score < assumptions.min_credit_score:
        return False, f"{req.loan_type.upper()} loans require minimum credit score of {assumptions.min_credit_score}. Provided: {req.credit_score}"

    # Loan limits (simplified - would need county-specific limits in production)
    if req.loan_type == "conventional":
        conforming = assumptions.conforming_limit_2024
        if req.loan_amount > conforming:
            return False, f"Loan amount ${req.loan_amount:,.2f} exceeds conforming limit ${conforming:,.2f}"

    if req.loan_type == "fha":
        fha_limit = assumptions.fha_loan_limit_2024
        if req.loan_amount > fha_limit:
            return False, f"Loan amount ${req.loan_amount:,.2f} exceeds FHA limit ${fha_limit:,.2f}"

    return True, None


def generate_quote_id() -> str:
    """Generate unique quote ID."""
    return f"Q-{uuid.uuid4().hex[:12].upper()}"
