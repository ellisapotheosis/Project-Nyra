"""
Tests for loan type models and assumptions.
"""
import pytest
from datetime import date

from bootstrap.services.quote_api.app.loan_types import (
    ConventionalAssumptions,
    FHAAssumptions,
    VAAssumptions,
    USDAAssumptions,
    LoanTypeRequest,
    get_loan_assumptions,
    calculate_upfront_fees,
    calculate_monthly_insurance,
    validate_loan_type_request,
    generate_quote_id,
)


class TestLoanAssumptions:
    """Test loan assumption models."""

    def test_conventional_assumptions(self):
        """Test conventional loan assumptions."""
        assumptions = ConventionalAssumptions()
        assert assumptions.loan_type == "conventional"
        assert assumptions.requires_pmi is True
        assert assumptions.max_ltv == 0.97
        assert assumptions.min_credit_score == 620
        assert assumptions.pmi_cancellation_ltv == 0.78

    def test_fha_assumptions(self):
        """Test FHA loan assumptions."""
        assumptions = FHAAssumptions()
        assert assumptions.loan_type == "fha"
        assert assumptions.upfront_fee_rate == 0.0175
        assert assumptions.annual_insurance_rate == 0.0055
        assert assumptions.can_finance_upfront_fee is True

    def test_va_assumptions(self):
        """Test VA loan assumptions."""
        assumptions = VAAssumptions()
        assert assumptions.loan_type == "va"
        assert assumptions.funding_fee_rate == 0.0218
        assert assumptions.requires_pmi is False
        assert assumptions.max_ltv == 1.0

    def test_usda_assumptions(self):
        """Test USDA loan assumptions."""
        assumptions = USDAAssumptions()
        assert assumptions.loan_type == "usda"
        assert assumptions.upfront_fee_rate == 0.01
        assert assumptions.annual_insurance_rate == 0.0035
        assert assumptions.can_finance_upfront_fee is True


class TestLoanTypeRequest:
    """Test loan type request model."""

    def test_ltv_calculation(self):
        """Test LTV calculation."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,
        )
        # LTV = (loan + down) / value = 500000 / 500000 = 1.0
        assert req.ltv == 1.0

    def test_down_payment_percent(self):
        """Test down payment percentage calculation."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,
        )
        assert req.down_payment_percent == 20.0


class TestUpfrontFees:
    """Test upfront fee calculations."""

    def test_fha_upfront_mip(self):
        """Test FHA upfront MIP calculation."""
        req = LoanTypeRequest(
            loan_amount=300000,
            property_value=310776,
            annual_interest_rate=0.065,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="fha",
            credit_score=620,
            down_payment=10776,
        )
        assumptions = get_loan_assumptions("fha")
        upfront = calculate_upfront_fees(req, assumptions)
        # 1.75% of 300000 = 5250
        assert upfront == 5250.0

    def test_va_funding_fee(self):
        """Test VA funding fee calculation."""
        req = LoanTypeRequest(
            loan_amount=450000,
            property_value=450000,
            annual_interest_rate=0.06,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="va",
            credit_score=660,
            down_payment=0,
        )
        assumptions = get_loan_assumptions("va")
        upfront = calculate_upfront_fees(req, assumptions)
        # 2.18% of 450000 = 9810
        assert upfront == 9810.0

    def test_usda_guarantee_fee(self):
        """Test USDA guarantee fee calculation."""
        req = LoanTypeRequest(
            loan_amount=250000,
            property_value=250000,
            annual_interest_rate=0.065,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="usda",
            credit_score=660,
            down_payment=0,
        )
        assumptions = get_loan_assumptions("usda")
        upfront = calculate_upfront_fees(req, assumptions)
        # 1% of 250000 = 2500
        assert upfront == 2500.0


class TestMonthlyInsurance:
    """Test monthly insurance calculations."""

    def test_conventional_pmi_high_ltv(self):
        """Test conventional PMI with high LTV (>95%)."""
        req = LoanTypeRequest(
            loan_amount=485000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=15000,  # 3% down, 97% LTV
        )
        assumptions = get_loan_assumptions("conventional")
        monthly_pmi = calculate_monthly_insurance(req, assumptions, req.loan_amount)
        # Should be ~1% annual = 485000 * 0.01 / 12 ≈ 404.17
        assert monthly_pmi > 400
        assert monthly_pmi < 410

    def test_conventional_no_pmi_low_ltv(self):
        """Test conventional loan with no PMI (LTV <= 80%)."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,  # 20% down, 80% LTV
        )
        assumptions = get_loan_assumptions("conventional")
        monthly_pmi = calculate_monthly_insurance(req, assumptions, req.loan_amount)
        assert monthly_pmi == 0.0

    def test_fha_mip(self):
        """Test FHA monthly MIP."""
        req = LoanTypeRequest(
            loan_amount=300000,
            property_value=310776,
            annual_interest_rate=0.065,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="fha",
            credit_score=620,
            down_payment=10776,
        )
        assumptions = get_loan_assumptions("fha")
        monthly_mip = calculate_monthly_insurance(req, assumptions, req.loan_amount)
        # 0.55% annual = 300000 * 0.0055 / 12 = 137.5
        assert abs(monthly_mip - 137.5) < 1.0

    def test_va_no_insurance(self):
        """Test VA loan has no monthly insurance."""
        req = LoanTypeRequest(
            loan_amount=450000,
            property_value=450000,
            annual_interest_rate=0.06,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="va",
            credit_score=660,
            down_payment=0,
        )
        assumptions = get_loan_assumptions("va")
        monthly_insurance = calculate_monthly_insurance(req, assumptions, req.loan_amount)
        assert monthly_insurance == 0.0


class TestValidation:
    """Test loan request validation."""

    def test_valid_conventional_loan(self):
        """Test valid conventional loan passes validation."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,
        )
        is_valid, error = validate_loan_type_request(req)
        assert is_valid is True
        assert error is None

    def test_conventional_ltv_too_high(self):
        """Test conventional loan fails with LTV > 97%."""
        req = LoanTypeRequest(
            loan_amount=495000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=5000,  # Only 1% down
        )
        is_valid, error = validate_loan_type_request(req)
        assert is_valid is False
        assert "down payment" in error.lower()

    def test_low_credit_score(self):
        """Test loan fails with low credit score."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=580,  # Below 620 minimum
            down_payment=100000,
        )
        is_valid, error = validate_loan_type_request(req)
        assert is_valid is False
        assert "credit score" in error.lower()


class TestQuoteIdGeneration:
    """Test quote ID generation."""

    def test_quote_id_format(self):
        """Test quote ID has correct format."""
        quote_id = generate_quote_id()
        assert quote_id.startswith("Q-")
        assert len(quote_id) == 15  # Q- + 12 hex chars

    def test_quote_id_uniqueness(self):
        """Test quote IDs are unique."""
        ids = {generate_quote_id() for _ in range(100)}
        assert len(ids) == 100  # All unique
