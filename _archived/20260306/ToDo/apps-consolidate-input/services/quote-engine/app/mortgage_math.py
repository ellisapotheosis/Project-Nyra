from __future__ import annotations

import math
from dataclasses import dataclass

@dataclass(frozen=True)
class PaymentBreakdown:
    principal_interest: float
    taxes: float
    insurance: float
    mi: float
    hoa: float

    @property
    def total(self) -> float:
        return self.principal_interest + self.taxes + self.insurance + self.mi + self.hoa

def monthly_pi(loan_amount: float, annual_rate: float, term_years: int) -> float:
    """Monthly principal+interest payment for a fixed-rate amortizing loan.

    annual_rate: e.g. 6.5 for 6.5%
    """
    if loan_amount <= 0:
        return 0.0
    r = (annual_rate / 100.0) / 12.0
    n = term_years * 12
    if r == 0:
        return loan_amount / n
    return loan_amount * (r * (1 + r) ** n) / ((1 + r) ** n - 1)

def estimate_tax_monthly(property_value: float, annual_tax_rate: float = 0.0125) -> float:
    return max(property_value, 0.0) * annual_tax_rate / 12.0

def estimate_insurance_monthly(property_value: float, annual_insurance_rate: float = 0.0035) -> float:
    return max(property_value, 0.0) * annual_insurance_rate / 12.0

def estimate_mi_monthly(loan_amount: float, property_value: float, credit_score: int | None = None) -> float:
    """Very rough PMI estimate, intended as placeholder until you ingest actual MI charts.

    Assumes MI only if LTV > 80%.
    """
    if property_value <= 0:
        return 0.0
    ltv = loan_amount / property_value
    if ltv <= 0.80:
        return 0.0
    # crude base annual MI factor
    base = 0.0060  # 0.60% annual
    if credit_score is not None:
        if credit_score >= 760:
            base = 0.0040
        elif credit_score >= 720:
            base = 0.0050
        elif credit_score >= 680:
            base = 0.0065
        else:
            base = 0.0080
    return loan_amount * base / 12.0

def estimate_cash_to_close(
    loan_amount: float,
    purchase_price: float | None,
    points: float = 0.0,
    lender_fees: float = 1895.0,
    third_party_fees: float = 3500.0,
    escrows_months: int = 3,
    tax_monthly: float = 0.0,
    ins_monthly: float = 0.0,
) -> float:
    """Simplified cash-to-close estimate.

    For purchase: assumes down payment = purchase_price - loan_amount.
    """
    points_cost = max(points, 0.0) / 100.0 * loan_amount
    escrows = escrows_months * (tax_monthly + ins_monthly)
    down_payment = 0.0
    if purchase_price is not None and purchase_price > 0:
        down_payment = max(purchase_price - loan_amount, 0.0)
    return points_cost + lender_fees + third_party_fees + escrows + down_payment
