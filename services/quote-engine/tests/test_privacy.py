from pydantic import ValidationError

from app.main import QuoteRequest
from app.privacy import redact_sensitive


def base_quote_request(**overrides):
    payload = {
        "loan_amount": 400000,
        "property_value": 500000,
        "credit_score": 720,
        "loan_type": "conventional",
        "loan_term": 30,
        "down_payment": 100000,
        "property_state": "ca",
        "property_zip": "90210",
        "borrower_email": "borrower@example.com",
    }
    payload.update(overrides)
    return payload


def test_redact_sensitive_quote_engine_text():
    value = redact_sensitive(
        "borrower@example.com +1 (555) 123-4567 Bearer abc.def token=secret"
    )

    assert "borrower@example.com" not in value
    assert "555" not in value
    assert "abc.def" not in value
    assert "secret" not in value


def test_quote_request_rejects_inconsistent_down_payment():
    try:
        QuoteRequest(**base_quote_request(down_payment=25000))
    except ValidationError as exc:
        assert "down_payment must match" in str(exc)
    else:
        raise AssertionError("QuoteRequest accepted inconsistent down payment")


def test_quote_request_normalizes_property_state():
    request = QuoteRequest(**base_quote_request(property_state="id"))
    assert request.property_state == "ID"
