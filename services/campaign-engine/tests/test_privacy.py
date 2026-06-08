from app.privacy import redact_sensitive


def test_redact_sensitive_campaign_engine_text():
    value = redact_sensitive(
        "lead@example.com +1 (555) 123-4567 Bearer abc.def token=secret"
    )

    assert "lead@example.com" not in value
    assert "555" not in value
    assert "abc.def" not in value
    assert "secret" not in value
