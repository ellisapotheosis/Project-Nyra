"""Regression tests for the production quote API entrypoint."""
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def main_client():
    """Create a client for app.main instead of the enhanced test app."""
    return TestClient(app)


def test_price_quote_defaults_to_purchase_loan_purpose(
    main_client, base_conventional_request
):
    """Rate-sheet pricing should work when no loan purpose is supplied."""
    response = main_client.post(
        "/quote/conventional/price", json=base_conventional_request
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["summary"]["loan_type"] == "conventional"
    assert data["summary"]["annual_interest_rate"] > 0


def test_validation_errors_are_json_serializable(
    main_client, base_conventional_request
):
    """Custom validator errors should return the intended 422 response."""
    base_conventional_request["annual_interest_rate"] = 7.0

    response = main_client.post("/quote/conventional", json=base_conventional_request)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert response.json()["error"] == "Validation Error"
    assert "use 0.07, not 7" in response.text
