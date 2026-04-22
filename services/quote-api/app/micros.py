"""
Utility for handling financial micros (cents * 10000).
"""
from __future__ import annotations

def from_micros(micros: int | float) -> float:
    """Convert micros to standard currency units."""
    return float(micros) / 1000000.0

def to_micros(value: float) -> int:
    """Convert standard currency units to micros."""
    return int(round(value * 1000000.0))

def format_micros(micros: int | float) -> str:
    """Format micros as a currency string."""
    return f"${from_micros(micros):,.2f}"
