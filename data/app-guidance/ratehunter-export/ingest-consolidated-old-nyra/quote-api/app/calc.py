from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import List, Tuple

from dateutil.relativedelta import relativedelta

from .models import PaymentFrequency, Compounding, QuoteRequest, QuoteSummary, AmortizationRow


def _periods_per_year(freq: PaymentFrequency) -> int:
    return {
        "Monthly": 12,
        "Semi-Monthly": 24,
        "Bi-Weekly": 26,
        "Weekly": 52,
        # Accelerated schedules keep their own period count
        "Acc Bi-Weekly": 26,
        "Acc Weekly": 52,
    }[freq]


def _next_date(current: date, freq: PaymentFrequency) -> date:
    # NOTE: Semi-monthly in real lending typically aligns to fixed days (e.g., 1st/15th).
    # This implementation uses a deterministic step to keep the API predictable.
    if freq == "Monthly":
        return (current + relativedelta(months=+1))
    if freq == "Semi-Monthly":
        return (current + relativedelta(days=+15))
    if freq in ("Bi-Weekly", "Acc Bi-Weekly"):
        return (current + relativedelta(days=+14))
    if freq in ("Weekly", "Acc Weekly"):
        return (current + relativedelta(days=+7))
    raise ValueError(f"Unknown frequency: {freq}")


def effective_periodic_rate(
    annual_nominal_rate: float,
    compounding: Compounding,
    periods_per_year: int,
) -> float:
    """Match the spreadsheet's approach:

    rate_per_period = (1 + annual_rate / CP)^(CP / periods_per_year) - 1

    Where CP is compounding periods per year (12 monthly, 2 semi-annually).
    """
    cp = 12 if compounding == "Monthly" else 2
    return (1 + annual_nominal_rate / cp) ** (cp / periods_per_year) - 1


def pmt(rate: float, nper: int, pv: float) -> float:
    """Standard PMT (payment) for an amortizing loan.

    Returns a POSITIVE payment amount.
    """
    if nper <= 0:
        raise ValueError("nper must be > 0")
    if abs(rate) < 1e-12:
        return pv / nper
    return pv * rate / (1 - (1 + rate) ** (-nper))


def _periodic_piti_addons(req: QuoteRequest, periods_per_year: int) -> float:
    tax = req.annual_property_tax / periods_per_year
    ins = req.annual_home_insurance / periods_per_year
    return tax + ins + req.monthly_hoa + req.monthly_pmi


def compute_payment(req: QuoteRequest) -> Tuple[float, float, int, int]:
    """Return (payment_PI, periodic_rate, periods_per_year, number_of_payments)."""
    ppy = _periods_per_year(req.payment_frequency)
    nper = int(req.term_years * ppy)
    r = effective_periodic_rate(req.annual_interest_rate, req.compounding, ppy)

    # Base payment depends on schedule type.
    if req.payment_frequency in ("Acc Bi-Weekly", "Acc Weekly"):
        # Typical lender convention: compute standard monthly payment, then split.
        monthly_r = effective_periodic_rate(req.annual_interest_rate, req.compounding, 12)
        monthly_pmt = pmt(monthly_r, req.term_years * 12, req.loan_amount)
        if req.payment_frequency == "Acc Bi-Weekly":
            pay = monthly_pmt / 2
        else:
            pay = monthly_pmt / 4
        return round(pay, 2), r, ppy, nper

    pay = pmt(r, nper, req.loan_amount)
    return round(pay, 2), r, ppy, nper


def amortization(req: QuoteRequest) -> Tuple[QuoteSummary, List[AmortizationRow]]:
    payment_pi, r, ppy, nper = compute_payment(req)
    addons = _periodic_piti_addons(req, ppy)

    balance = req.loan_amount
    current_date = req.start_date
    rows: List[AmortizationRow] = []

    total_interest = 0.0
    total_paid = 0.0

    for i in range(1, nper + 1):
        interest = round(balance * r, 2)
        principal = round(payment_pi - interest, 2)
        extra = round(req.extra.amount, 2) if req.extra and req.extra.amount else 0.0

        # Final payment adjustment
        if principal + extra > balance:
            principal = balance
            extra = 0.0

        balance = round(balance - principal - extra, 2)
        if balance < 0:
            balance = 0.0

        total_interest += interest
        total_paid += payment_pi + addons + extra

        rows.append(
            AmortizationRow(
                period=i,
                date=current_date,
                payment=round(payment_pi + addons, 2),
                principal=principal,
                interest=interest,
                extra_principal=extra,
                balance=balance,
            )
        )

        if balance <= 0:
            payoff_date = current_date
            break

        current_date = _next_date(current_date, req.payment_frequency)
    else:
        payoff_date = rows[-1].date if rows else req.start_date

    periodic_payment_piti = round(payment_pi + addons, 2)

    summary = QuoteSummary(
        periodic_payment_pi=payment_pi,
        periodic_interest_rate=r,
        periods_per_year=ppy,
        number_of_payments=len(rows),
        total_interest=round(total_interest, 2),
        total_paid=round(total_paid, 2),
        payoff_date=payoff_date,
        periodic_payment_piti=periodic_payment_piti,
    )

    return summary, rows
