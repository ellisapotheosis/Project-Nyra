from app.mortgage_math import monthly_pi

def test_monthly_pi_zero_rate():
    assert abs(monthly_pi(120000, 0.0, 30) - 333.3333) < 0.01

def test_monthly_pi_known_value():
    # sanity check: 300k @ 6.0% 30yr ~ 1798.65
    v = monthly_pi(300000, 6.0, 30)
    assert abs(v - 1798.65) < 5.0
