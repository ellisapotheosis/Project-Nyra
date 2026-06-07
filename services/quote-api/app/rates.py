"""
Rate sheet management and application.
"""
from __future__ import annotations

import json
import os
from typing import Dict, Any

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "rate_sheets.json")

def load_rate_sheet() -> Dict[str, Any]:
    """Load the current rate sheet from JSON."""
    try:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
    except Exception:
        pass

    # Default fallback if file missing or error
    return {
        "base_rates": {"conventional": {"30yr": 0.07}},
        "llpas": {"credit_score": [], "ltv": [], "purpose": []}
    }

def get_adjusted_rate(loan_type: str, term_years: int, credit_score: int, ltv: float, **kwargs) -> float:
    """Calculate the final adjusted rate based on base rates and LLPAs."""
    sheet = load_rate_sheet()

    term_key = f"{term_years}yr"
    base_rate = sheet.get("base_rates", {}).get(loan_type, {}).get(term_key, 0.07)

    adjustment = 0.0

    # Apply Credit Score LLPAs
    for rule in sheet.get("llpas", {}).get("credit_score", []):
        if credit_score >= rule.get("min", 0) and credit_score <= rule.get("max", 999):
            adjustment += rule.get("adjustment", 0)
            break

    # Apply LTV LLPAs
    for rule in sheet.get("llpas", {}).get("ltv", []):
        if ltv >= rule.get("min", 0) and ltv <= rule.get("max", 1.0):
            adjustment += rule.get("adjustment", 0)
            break

    # Apply Loan Purpose LLPAs
    loan_purpose = kwargs.get("loan_purpose", "PURCHASE").upper()
    for rule in sheet.get("llpas", {}).get("purpose", []):
        if loan_purpose == rule.get("key", "").upper():
            adjustment += rule.get("adjustment", 0)
            break

    return base_rate + adjustment
