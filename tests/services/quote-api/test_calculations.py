"""
Tests for loan calculation logic.
"""
import pytest
from datetime import date

from bootstrap.services.quote_api.app.loan_calc import calculate_loan_type_quote
from bootstrap.services.quote_api.app.loan_types import LoanTypeRequest


class TestConventionalCalculations:
    """Test conventional loan calculations."""

    def test_conventional_payment_calculation(self):
        """Test conventional P&I payment calculation."""
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

        summary, schedule = calculate_loan_type_quote(req)

        # Payment should be ~$2661 for 400k at 7% for 30 years
        assert summary.periodic_payment_pi > 2600
        assert summary.periodic_payment_pi < 2700
        assert summary.number_of_payments == 360

    def test_conventional_total_interest(self):
        """Test total interest calculation."""
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

        summary, schedule = calculate_loan_type_quote(req)

        # Total interest should be significant for 30-year loan
        assert summary.total_interest > 500000
        assert summary.total_interest < 600000


class TestFHACalculations:
    """Test FHA loan calculations."""

    def test_fha_upfront_mip_financed(self):
        """Test FHA upfront MIP is financed into loan."""
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

        summary, schedule = calculate_loan_type_quote(req)

        # Upfront MIP should be 1.75%
        assert summary.upfront_fees == 300000 * 0.0175

        # Financed amount should include upfront MIP
        expected_financed = 300000 + (300000 * 0.0175)
        assert abs(summary.financed_amount - expected_financed) < 1.0

    def test_fha_monthly_mip(self):
        """Test FHA monthly MIP calculation."""
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

        summary, schedule = calculate_loan_type_quote(req)

        # Monthly MIP should be ~0.55% annual / 12
        expected_monthly_mip = (300000 * 0.0055) / 12
        assert abs(summary.monthly_pmi_or_mip - expected_monthly_mip) < 5.0


class TestVACalculations:
    """Test VA loan calculations."""

    def test_va_funding_fee_financed(self):
        """Test VA funding fee is financed into loan."""
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

        summary, schedule = calculate_loan_type_quote(req)

        # Funding fee should be 2.18%
        expected_fee = 450000 * 0.0218
        assert abs(summary.upfront_fees - expected_fee) < 1.0

        # Financed amount should include funding fee
        expected_financed = 450000 + expected_fee
        assert abs(summary.financed_amount - expected_financed) < 1.0

    def test_va_no_monthly_insurance(self):
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

        summary, schedule = calculate_loan_type_quote(req)

        assert summary.monthly_pmi_or_mip == 0.0
        assert summary.total_pmi_or_mip == 0.0


class TestUSDACalculations:
    """Test USDA loan calculations."""

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

        summary, schedule = calculate_loan_type_quote(req)

        # Upfront fee should be 1%
        expected_fee = 250000 * 0.01
        assert abs(summary.upfront_fees - expected_fee) < 1.0

    def test_usda_annual_fee(self):
        """Test USDA annual fee calculation."""
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

        summary, schedule = calculate_loan_type_quote(req)

        # Monthly fee should be ~0.35% annual / 12
        expected_monthly_fee = (250000 * 0.0035) / 12
        assert abs(summary.monthly_pmi_or_mip - expected_monthly_fee) < 2.0


class TestAmortizationSchedule:
    """Test amortization schedule generation."""

    def test_schedule_length(self):
        """Test schedule has correct number of payments."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,
            include_schedule=True,
        )

        summary, schedule = calculate_loan_type_quote(req)

        assert len(schedule) == 360  # 30 years * 12 months
        assert schedule[0].period == 1
        assert schedule[-1].period == 360

    def test_balance_decreases(self):
        """Test balance decreases over time."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,
            include_schedule=True,
        )

        summary, schedule = calculate_loan_type_quote(req)

        # Balance should decrease
        assert schedule[0].balance < 400000
        assert schedule[-1].balance == 0.0

        # Each payment should reduce balance
        for i in range(1, len(schedule)):
            assert schedule[i].balance <= schedule[i-1].balance

    def test_final_payment_zeroes_balance(self):
        """Test final payment brings balance to zero."""
        req = LoanTypeRequest(
            loan_amount=400000,
            property_value=500000,
            annual_interest_rate=0.07,
            term_years=30,
            start_date=date(2024, 1, 1),
            loan_type="conventional",
            credit_score=720,
            down_payment=100000,
            include_schedule=True,
        )

        summary, schedule = calculate_loan_type_quote(req)

        assert schedule[-1].balance == 0.0
