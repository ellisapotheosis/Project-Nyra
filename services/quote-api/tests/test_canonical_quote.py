from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def canonical_quote_payload(**overrides):
    payload = {
        "leadId": "lead_123",
        "requestedBy": "user_123",
        "requestedAt": "2026-05-11T18:00:00.000Z",
        "baseRate": 6.75,
        "termYears": 30,
        "loanScenario": {
            "purpose": "PURCHASE",
            "loanAmount": {"amountCents": 40000000, "currency": "USD"},
            "propertyValue": {"amountCents": 50000000, "currency": "USD"},
            "downPayment": {"amountCents": 10000000, "currency": "USD"},
            "state": "CA",
            "occupancy": "PRIMARY",
            "loanType": "CONVENTIONAL",
            "creditScore": 740,
        },
    }
    payload.update(overrides)
    return payload


def test_canonical_quote_response_shape():
    response = client.post(
        "/api/quotes/generate",
        json=canonical_quote_payload(),
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["leadId"] == "lead_123"
    assert payload["status"] == "READY"
    assert len(payload["options"]) == 3
    assert [option["kind"] for option in payload["options"]] == [
        "LOWEST_PAYMENT",
        "BALANCED",
        "LOWEST_COST",
    ]
    assert all(option["monthlyPayment"]["amountCents"] > 0 for option in payload["options"])
    assert all(option["calculationTrace"]["engine"] == "nyra-quote-api" for option in payload["options"])
    assert payload["expiresAt"]


def test_zero_interest_generic_quote_is_supported():
    response = client.post(
        "/quote",
        json={
            "loan_amount": 360000,
            "annual_interest_rate": 0,
            "term_years": 30,
            "start_date": "2026-06-01",
            "include_schedule": False,
        },
    )

    assert response.status_code == 200
    assert response.json()["summary"]["periodic_payment_pi"] == 1000


def test_canonical_quote_rejects_down_payment_at_or_above_property_value():
    response = client.post(
        "/api/v1/quote",
        json=canonical_quote_payload(
            loanScenario={
                "purpose": "PURCHASE",
                "loanAmount": {"amountCents": 40000000, "currency": "USD"},
                "propertyValue": {"amountCents": 50000000, "currency": "USD"},
                "downPayment": {"amountCents": 50000000, "currency": "USD"},
                "state": "CA",
                "occupancy": "PRIMARY",
            }
        ),
    )

    assert response.status_code == 422


def test_canonical_quote_applies_pmi_above_80_ltv_only():
    low_ltv = client.post(
        "/api/v1/quote",
        json=canonical_quote_payload(),
    )
    high_ltv = client.post(
        "/api/v1/quote",
        json=canonical_quote_payload(
            loanScenario={
                "purpose": "PURCHASE",
                "loanAmount": {"amountCents": 45000000, "currency": "USD"},
                "propertyValue": {"amountCents": 50000000, "currency": "USD"},
                "downPayment": {"amountCents": 5000000, "currency": "USD"},
                "state": "CA",
                "occupancy": "PRIMARY",
                "loanType": "CONVENTIONAL",
                "pmiRateBps": 60,
            }
        ),
    )

    assert low_ltv.status_code == 200
    assert high_ltv.status_code == 200
    assert low_ltv.json()["options"][0]["calculationTrace"]["monthlyPmiCents"] == 0
    assert high_ltv.json()["options"][0]["calculationTrace"]["monthlyPmiCents"] > 0


def test_canonical_three_option_tradeoffs_are_deterministic():
    response = client.post("/api/v1/quote", json=canonical_quote_payload())

    assert response.status_code == 200
    options = response.json()["options"]
    assert [option["label"] for option in options] == [
        "Buy-down",
        "Standard par",
        "Lender credit",
    ]
    assert options[0]["rate"] < options[1]["rate"] < options[2]["rate"]
    assert options[0]["cashToClose"]["amountCents"] > options[1]["cashToClose"]["amountCents"]
    assert options[2]["cashToClose"]["amountCents"] < options[1]["cashToClose"]["amountCents"]
