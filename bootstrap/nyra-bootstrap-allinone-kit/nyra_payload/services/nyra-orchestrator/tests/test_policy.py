from app.policy import classify_message

def test_block_sensitive():
    d, _ = classify_message("My SSN is 123-45-6789")
    assert d == "block"

def test_needs_human_rates():
    d, _ = classify_message("Can you quote me a rate?")
    assert d == "needs_human"

def test_allow_logistics():
    d, _ = classify_message("Can you resend the upload link?")
    assert d == "allow"
