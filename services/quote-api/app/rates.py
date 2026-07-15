"""
Rate sheet management and application.
Deterministic calculation logic.
"""
from __future__ import annotations

import json
import os
from typing import Dict, Any

# Canonical, hardcoded mathematical rate assumptions (Source of truth)
DETERMINISTIC_RATE_SHEET = {
    "effective_date": "2026-01-27",
    "base_rates": {
        "conventional": {
            "30yr": 0.06625,
            "15yr": 0.05875
        },
        "fha": {
            "30yr": 0.06125
        },
        "va": {
            "30yr": 0.06125
        },
        "usda": {
            "30yr": 0.0625
        }
    },
    "llpas": {
        "credit_score": [
            { "min": 740, "max": 999, "adjustment": 0.0 },
            { "min": 720, "max": 739, "adjustment": 0.0025 },
            { "min": 700, "max": 719, "adjustment": 0.005 },
            { "min": 680, "max": 699, "adjustment": 0.0075 },
            { "min": 660, "max": 679, "adjustment": 0.0125 },
            { "min": 0, "max": 659, "adjustment": 0.02 }
        ],
        "ltv": [
            { "min": 0.95, "max": 2.0, "adjustment": 0.005 },
            { "min": 0.90, "max": 0.949, "adjustment": 0.0025 },
            { "min": 0.0, "max": 0.899, "adjustment": 0.0 }
        ]
    }
}

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "rate_sheets.json")

def load_rate_sheet() -> Dict[str, Any]:
    """Load current rate sheet from JSON with compile-time deterministic fallback."""
    try:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
    except Exception:
        pass
    return DETERMINISTIC_RATE_SHEET

def get_adjusted_rate(loan_type: str, term_years: int, credit_score: int, ltv: float) -> float:
    """
    Calculate final adjusted interest rate using deterministic mathematical assumptions.
    
    Inputs:
        loan_type: e.g. "conventional", "fha", "va", "usda"
        term_years: e.g. 15, 30
        credit_score: FICO score (e.g. 720)
        ltv: Loan-to-Value ratio (e.g. 0.90)
    """
    sheet = load_rate_sheet()
    
    # Resolve base rate
    term_key = f"{term_years}yr"
    base_rate = sheet.get("base_rates", {}).get(loan_type, {}).get(term_key, 0.07)
    
    adjustment = 0.0
    
    # Credit Score Loan-Level Price Adjustment (LLPA)
    credit_rules = sheet.get("llpas", {}).get("credit_score", DETERMINISTIC_RATE_SHEET["llpas"]["credit_score"])
    for rule in credit_rules:
        if credit_score >= rule.get("min", 0) and credit_score <= rule.get("max", 999):
            adjustment += rule.get("adjustment", 0)
            break
            
    # Loan-To-Value Loan-Level Price Adjustment (LLPA)
    ltv_rules = sheet.get("llpas", {}).get("ltv", DETERMINISTIC_RATE_SHEET["llpas"]["ltv"])
    for rule in ltv_rules:
        if ltv >= rule.get("min", 0.0) and ltv <= rule.get("max", 2.0):
            adjustment += rule.get("adjustment", 0)
            break
            
    return base_rate + adjustment
