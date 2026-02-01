from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

Decision = Literal["allow","needs_human","block"]

# Keywords that usually imply loan advice, pricing, or underwriting promises.
RISKY_PATTERNS = [
    r"rate\b", r"apr\b", r"points?\b", r"lock\b", r"quote\b", r"payment\b",
    r"approval\b", r"approved\b", r"guarantee\b", r"underwrite\b", r"ltv\b", r"dti\b",
    r"credit score\b", r"closing costs?\b", r"fees?\b", r"lender\b",
]

SENSITIVE_DATA_PATTERNS = [
    r"\bssn\b", r"social security", r"date of birth", r"\bdob\b",
    r"bank account", r"routing number", r"account number",
]

def classify_message(text: str) -> tuple[Decision, str]:
    t = (text or "").lower()

    for p in SENSITIVE_DATA_PATTERNS:
        if re.search(p, t):
            return ("block", "Sensitive data request detected. Redirect user to secure upload/portal.")

    for p in RISKY_PATTERNS:
        if re.search(p, t):
            return ("needs_human", "Loan-specific request detected. Escalate to licensed human.")

    # Otherwise treat as logistical.
    return ("allow", "Logistics-only message.")
