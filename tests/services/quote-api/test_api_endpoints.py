"""
Tests for API endpoints.
"""
import pytest
from fastapi import status


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self, test_client):
        """Test health check returns OK."""
        response = test_client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["ok"] is True
        assert "version" in data


class TestRootEndpoint:
    """Test root endpoint."""

    def test_root_info(self, test_client):
        """Test root returns API information."""
        response = test_client.get("/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "service" in data
        assert "endpoints" in data
        assert "conventional" in data["endpoints"]


class TestLoanTypesEndpoint:
    """Test loan types information endpoint."""

    def test_get_loan_types(self, test_client):
        """Test loan types endpoint returns all types."""
        response = test_client.get("/quote/loan-types")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "loan_types" in data

        loan_types = {lt["type"] for lt in data["loan_types"]}
        assert loan_types == {"conventional", "fha", "va", "usda"}


class TestConventionalEndpoint:
    """Test conventional loan endpoint."""

    def test_conventional_quote_success(self, test_client, base_conventional_request):
        """Test successful conventional quote."""
        response = test_client.post("/quote/conventional", json=base_conventional_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "quote_id" in data
        assert data["quote_id"].startswith("Q-")
        assert data["summary"]["loan_type"] == "conventional"
        assert data["summary"]["periodic_payment_pi"] > 0
        assert data["summary"]["monthly_pmi_or_mip"] == 0.0  # 20% down, no PMI

    def test_conventional_with_pmi(self, test_client, base_conventional_request):
        """Test conventional quote with PMI (LTV > 80%)."""
        # Modify to 10% down (90% LTV)
        base_conventional_request["down_payment"] = 50000.0
        base_conventional_request["loan_amount"] = 450000.0

        response = test_client.post("/quote/conventional", json=base_conventional_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["summary"]["monthly_pmi_or_mip"] > 0  # Should have PMI
        assert data["summary"]["ltv"] == 1.0

    def test_conventional_invalid_ltv(self, test_client, base_conventional_request):
        """Test conventional fails with invalid LTV."""
        # Set LTV > 97%
        base_conventional_request["down_payment"] = 5000.0
        base_conventional_request["loan_amount"] = 495000.0

        response = test_client.post("/quote/conventional", json=base_conventional_request)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "down payment" in response.json()["detail"].lower()

    def test_conventional_with_schedule(self, test_client, base_conventional_request):
        """Test conventional quote with amortization schedule."""
        base_conventional_request["include_schedule"] = True

        response = test_client.post("/quote/conventional", json=base_conventional_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "schedule" in data
        assert data["schedule"] is not None
        assert len(data["schedule"]) > 0
        assert data["schedule"][0]["period"] == 1


class TestFHAEndpoint:
    """Test FHA loan endpoint."""

    def test_fha_quote_success(self, test_client, base_fha_request):
        """Test successful FHA quote."""
        response = test_client.post("/quote/fha", json=base_fha_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["summary"]["loan_type"] == "fha"
        assert data["summary"]["upfront_fees"] > 0  # 1.75% MIP
        assert data["summary"]["monthly_pmi_or_mip"] > 0  # Annual MIP

        # Check upfront MIP (1.75% of 300000 = 5250)
        expected_upfront = 300000 * 0.0175
        assert abs(data["summary"]["upfront_fees"] - expected_upfront) < 1.0

    def test_fha_financed_amount(self, test_client, base_fha_request):
        """Test FHA financed amount includes upfront MIP."""
        response = test_client.post("/quote/fha", json=base_fha_request)
        data = response.json()

        # Financed = base + upfront MIP
        expected_financed = 300000 + (300000 * 0.0175)
        assert abs(data["summary"]["financed_amount"] - expected_financed) < 1.0


class TestVAEndpoint:
    """Test VA loan endpoint."""

    def test_va_quote_success(self, test_client, base_va_request):
        """Test successful VA quote."""
        response = test_client.post("/quote/va", json=base_va_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["summary"]["loan_type"] == "va"
        assert data["summary"]["upfront_fees"] > 0  # 2.18% funding fee
        assert data["summary"]["monthly_pmi_or_mip"] == 0.0  # No PMI/MIP

        # Check funding fee (2.18% of 450000 = 9810)
        expected_fee = 450000 * 0.0218
        assert abs(data["summary"]["upfront_fees"] - expected_fee) < 1.0

    def test_va_zero_down_payment(self, test_client, base_va_request):
        """Test VA loan with 0% down payment."""
        base_va_request["down_payment"] = 0.0

        response = test_client.post("/quote/va", json=base_va_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["summary"]["down_payment"] == 0.0
        assert data["summary"]["ltv"] == 1.0


class TestUSDAEndpoint:
    """Test USDA loan endpoint."""

    def test_usda_quote_success(self, test_client, base_usda_request):
        """Test successful USDA quote."""
        response = test_client.post("/quote/usda", json=base_usda_request)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["summary"]["loan_type"] == "usda"
        assert data["summary"]["upfront_fees"] > 0  # 1% guarantee fee
        assert data["summary"]["monthly_pmi_or_mip"] > 0  # 0.35% annual fee

        # Check upfront fee (1% of 250000 = 2500)
        expected_fee = 250000 * 0.01
        assert abs(data["summary"]["upfront_fees"] - expected_fee) < 1.0


class TestCompareLoanTypes:
    """Test compare loan types endpoint."""

    def test_compare_all_loan_types(self, test_client):
        """Test comparing all loan types for same property."""
        request_data = {
            "loan_amount": 400000.0,
            "property_value": 500000.0,
            "annual_interest_rate": 0.07,
            "term_years": 30,
            "start_date": "2024-01-01",
            "loan_type": "conventional",  # Base type, will compare all
            "credit_score": 720,
            "down_payment": 100000.0,
            "annual_property_tax": 6000.0,
            "annual_home_insurance": 1200.0,
        }

        response = test_client.post("/quote/compare-loan-types", json=request_data)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "comparison" in data
        assert "conventional" in data["comparison"]
        assert "fha" in data["comparison"]
        assert "va" in data["comparison"]
        assert "usda" in data["comparison"]

        # Conventional should be available with these parameters
        assert data["comparison"]["conventional"]["available"] is True
        assert "monthly_payment" in data["comparison"]["conventional"]


class TestErrorHandling:
    """Test error handling."""

    def test_missing_required_fields(self, test_client):
        """Test error when required fields are missing."""
        incomplete_request = {
            "loan_amount": 400000.0,
            "property_value": 500000.0,
            # Missing required fields
        }

        response = test_client.post("/quote/conventional", json=incomplete_request)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_invalid_loan_amount(self, test_client, base_conventional_request):
        """Test error with invalid loan amount."""
        base_conventional_request["loan_amount"] = -100000

        response = test_client.post("/quote/conventional", json=base_conventional_request)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_invalid_credit_score(self, test_client, base_conventional_request):
        """Test error with invalid credit score."""
        base_conventional_request["credit_score"] = 400  # Below minimum

        response = test_client.post("/quote/conventional", json=base_conventional_request)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
