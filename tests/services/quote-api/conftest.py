"""
Pytest configuration and fixtures for quote-api tests.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import date


@pytest.fixture
def test_client():
    """Create FastAPI test client."""
    # Import here to avoid circular imports
    from bootstrap.services.quote_api.app.main_enhanced import app
    return TestClient(app)


@pytest.fixture
def base_conventional_request():
    """Base request data for conventional loan."""
    return {
        "loan_amount": 400000.0,
        "property_value": 500000.0,
        "annual_interest_rate": 0.07,
        "term_years": 30,
        "start_date": "2024-01-01",
        "loan_type": "conventional",
        "credit_score": 720,
        "down_payment": 100000.0,  # 20% down, no PMI
        "annual_property_tax": 6000.0,
        "annual_home_insurance": 1200.0,
        "monthly_hoa": 100.0,
        "include_schedule": False,
    }


@pytest.fixture
def base_fha_request():
    """Base request data for FHA loan."""
    return {
        "loan_amount": 300000.0,
        "property_value": 310776.0,  # 3.5% down
        "annual_interest_rate": 0.065,
        "term_years": 30,
        "start_date": "2024-01-01",
        "loan_type": "fha",
        "credit_score": 620,
        "down_payment": 10776.0,
        "annual_property_tax": 4500.0,
        "annual_home_insurance": 900.0,
        "include_schedule": False,
    }


@pytest.fixture
def base_va_request():
    """Base request data for VA loan."""
    return {
        "loan_amount": 450000.0,
        "property_value": 450000.0,  # 0% down
        "annual_interest_rate": 0.06,
        "term_years": 30,
        "start_date": "2024-01-01",
        "loan_type": "va",
        "credit_score": 660,
        "down_payment": 0.0,
        "annual_property_tax": 5400.0,
        "annual_home_insurance": 1080.0,
        "include_schedule": False,
    }


@pytest.fixture
def base_usda_request():
    """Base request data for USDA loan."""
    return {
        "loan_amount": 250000.0,
        "property_value": 250000.0,  # 0% down
        "annual_interest_rate": 0.065,
        "term_years": 30,
        "start_date": "2024-01-01",
        "loan_type": "usda",
        "credit_score": 660,
        "down_payment": 0.0,
        "annual_property_tax": 3000.0,
        "annual_home_insurance": 600.0,
        "include_schedule": False,
    }
