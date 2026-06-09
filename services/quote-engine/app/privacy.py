import re
from typing import Any

REDACTION_PATTERNS = (
    (re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE), "[REDACTED_EMAIL]"),
    (re.compile(r"\+?\d[\d\s().-]{8,}\d"), "[REDACTED_PHONE]"),
    (re.compile(r"\b\d{3}-?\d{2}-?\d{4}\b"), "[REDACTED_SSN]"),
    (re.compile(r"(authorization|token|secret|api[_-]?key|password)=([^&\s]+)", re.IGNORECASE), r"\1=[REDACTED]"),
    (re.compile(r"(Bearer\s+)[A-Za-z0-9._~+/-]+=*", re.IGNORECASE), r"\1[REDACTED]"),
)


def redact_sensitive(value: Any) -> str:
    text = str(value)
    for pattern, replacement in REDACTION_PATTERNS:
        text = pattern.sub(replacement, text)
    return text
