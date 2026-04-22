"""
Loan-type-specific calculation logic.
"""
from __future__ import annotations

from typing import List, Tuple
from datetime import date
from dateutil.relativedelta import relativedelta

from .loan_types import (
    LoanTypeRequest,
    LoanTypeQuoteSummary,
    LoanAssumptions,
    get_loan_assumptions,
    calculate_upfront_fees,
    calculate_monthly_insurance,
    generate_quote_id,
)
from .calc import effective_periodic_rate, pmt, _next_date, _periods_per_year
from .models import AmortizationRow


def calculate_loan_type_quote(req: LoanTypeRequest) -> Tuple[LoanTypeQuoteSummary, List[AmortizationRow]]:
    """
    Calculate complete loan quote with loan-type-specific logic.

    Returns:
        Tuple of (summary, amortization_schedule)
    """

    # Get loan-type assumptions
    assumptions = get_loan_assumptions(req.loan_type)

    # Calculate upfront fees
    upfront_fees = calculate_upfront_fees(req, assumptions)

    # Financed amount (base + upfront fees if applicable)
    financed_amount = req.loan_amount
    if assumptions.can_finance_upfront_fee and upfront_fees > 0:
        financed_amount += upfront_fees

    # Calculate periodic rate and payment
    ppy = _periods_per_year(req.payment_frequency)
    r = effective_periodic_rate(req.annual_interest_rate, req.compounding, ppy)
    nper = int(req.term_years * ppy)

    # Base P&I payment
    payment_pi = pmt(r, nper, financed_amount)
    payment_pi = round(payment_pi, 2)

    # Initialize amortization
    balance = financed_amount
    current_date = req.start_date
    rows: List[AmortizationRow] = []

    total_interest = 0.0
    total_pmi_or_mip = 0.0
    total_paid = 0.0

    # Calculate periodic additional costs
    tax = req.annual_property_tax / ppy
    ins = req.annual_home_insurance / ppy
    hoa = req.monthly_hoa if req.payment_frequency == "Monthly" else req.monthly_hoa / (ppy / 12)

    for i in range(1, nper + 1):
        # Interest and principal
        interest = round(balance * r, 2)
        principal = round(payment_pi - interest, 2)
        extra = round(req.extra_principal, 2)

        # Calculate monthly insurance (PMI/MIP) based on current balance
        monthly_insurance = calculate_monthly_insurance(req, assumptions, balance)
        monthly_insurance = round(monthly_insurance, 2)

        # Adjust for final payment
        if principal + extra > balance:
            principal = balance
            extra = 0.0

        balance = round(balance - principal - extra, 2)
        if balance < 0:
            balance = 0.0

        # Calculate total payment for this period
        period_payment = round(payment_pi + tax + ins + hoa + monthly_insurance, 2)

        # Track totals
        total_interest += interest
        total_pmi_or_mip += monthly_insurance
        total_paid += period_payment + extra

        rows.append(
            AmortizationRow(
                period=i,
                date=current_date,
                payment=period_payment,
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

    # Calculate typical monthly PMI/MIP (for display)
    monthly_pmi = calculate_monthly_insurance(req, assumptions, financed_amount)

    # Create summary
    quote_id = generate_quote_id()

    # Build assumptions dict
    assumptions_dict = {
        "loan_type": req.loan_type,
        "upfront_fee_rate": assumptions.upfront_fee_rate,
        "annual_insurance_rate": assumptions.annual_insurance_rate,
        "funding_fee_rate": assumptions.funding_fee_rate,
        "can_finance_upfront_fee": assumptions.can_finance_upfront_fee,
        "requires_pmi": assumptions.requires_pmi,
        "max_ltv": assumptions.max_ltv,
        "min_credit_score": assumptions.min_credit_score,
    }

    # Add loan-specific limits
    if req.loan_type == "conventional":
        assumptions_dict["conforming_limit"] = assumptions.conforming_limit_2024
        assumptions_dict["pmi_cancellation_ltv"] = assumptions.pmi_cancellation_ltv
    elif req.loan_type == "fha":
        assumptions_dict["fha_loan_limit"] = assumptions.fha_loan_limit_2024
    elif req.loan_type == "va":
        assumptions_dict["va_loan_limit"] = assumptions.va_loan_limit_2024

    periodic_payment_piti = round(
        payment_pi + tax + ins + hoa + monthly_pmi, 2
    )

    from .micros import to_micros

    summary = LoanTypeQuoteSummary(
        quote_id=quote_id,
        loan_type=req.loan_type,
        base_loan_amount=req.loan_amount,
        base_loan_amount_micros=to_micros(req.loan_amount),
        upfront_fees=round(upfront_fees, 2),
        upfront_fees_micros=to_micros(upfront_fees),
        financed_amount=round(financed_amount, 2),
        financed_amount_micros=to_micros(financed_amount),
        periodic_payment_pi=payment_pi,
        periodic_payment_pi_micros=to_micros(payment_pi),
        monthly_pmi_or_mip=round(monthly_pmi, 2),
        monthly_pmi_or_mip_micros=to_micros(monthly_pmi),
        periodic_payment_piti=periodic_payment_piti,
        periodic_payment_piti_micros=to_micros(periodic_payment_piti),
        periodic_interest_rate=r,
        annual_interest_rate=req.annual_interest_rate,
        periods_per_year=ppy,
        number_of_payments=len(rows),
        term_years=req.term_years,
        total_interest=round(total_interest, 2),
        total_interest_micros=to_micros(total_interest),
        total_pmi_or_mip=round(total_pmi_or_mip, 2),
        total_pmi_or_mip_micros=to_micros(total_pmi_or_mip),
        total_paid=round(total_paid, 2),
        total_paid_micros=to_micros(total_paid),
        payoff_date=payoff_date,
        ltv=round(req.ltv, 4),
        down_payment=req.down_payment,
        down_payment_micros=to_micros(req.down_payment),
        property_value=req.property_value,
        property_value_micros=to_micros(req.property_value),
        credit_score=req.credit_score,
        assumptions=assumptions_dict,
    )

    return summary, rows
