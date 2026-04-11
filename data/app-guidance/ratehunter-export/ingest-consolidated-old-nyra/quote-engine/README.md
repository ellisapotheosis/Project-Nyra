# Quote Engine (FastAPI)

Scriptable quoting API to replace manual spreadsheet-driven quote assembly.

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 9010
```

## Endpoints
- `POST /v1/quotes/soft` — compute multiple quote options (P&I + est escrows + MI + cash-to-close estimate)

## Notes
- This is a baseline calculator. Add lender/product rules, pricing imports, and PDF rendering later.
