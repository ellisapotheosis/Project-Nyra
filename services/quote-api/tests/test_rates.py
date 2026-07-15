from app.rates import get_adjusted_rate, load_rate_sheet, DETERMINISTIC_RATE_SHEET

def test_load_rate_sheet():
    """Verify that load_rate_sheet returns a valid rate sheet with base rates and LLPAs."""
    sheet = load_rate_sheet()
    assert "base_rates" in sheet
    assert "llpas" in sheet
    assert "conventional" in sheet["base_rates"]

def test_get_adjusted_rate_conventional_excellent_credit_low_ltv():
    """Conventional, credit score 760 (no adjustment), LTV 0.80 (no adjustment) -> 0.06625."""
    rate = get_adjusted_rate(
        loan_type="conventional",
        term_years=30,
        credit_score=760,
        ltv=0.80
    )
    assert rate == 0.06625

def test_get_adjusted_rate_conventional_poor_credit_high_ltv():
    """
    Conventional, 30yr base = 0.06625
    Credit score 650 -> adjustment 0.02
    LTV 0.95 -> adjustment 0.005
    Expected: 0.06625 + 0.02 + 0.005 = 0.09125
    """
    rate = get_adjusted_rate(
        loan_type="conventional",
        term_years=30,
        credit_score=650,
        ltv=0.95
    )
    assert rate == 0.09125

def test_get_adjusted_rate_fha_average_credit():
    """
    FHA, 30yr base = 0.06125
    Credit score 710 -> adjustment 0.005
    LTV 0.92 -> adjustment 0.0025
    Expected: 0.06125 + 0.005 + 0.0025 = 0.06875
    """
    rate = get_adjusted_rate(
        loan_type="fha",
        term_years=30,
        credit_score=710,
        ltv=0.92
    )
    assert rate == 0.06875
