#!/bin/bash
source venv/bin/activate
python agents/intake_agent/intake.py &
python agents/mortgage_match_agent/matcher.py
