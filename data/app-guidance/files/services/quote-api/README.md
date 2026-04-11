# Nyra Quote API (services/quote-api)

This service turns your spreadsheet-style mortgage quote logic into a **scriptable HTTP API**.

It intentionally supports the same *shape* of inputs used in your `All in One Calculator` workbook:
- loan amount
- annual rate
- term
- compounding (Monthly vs Semi-Annually)
- payment frequency (Monthly / Semi-monthly / Bi-weekly / Weekly / Accelerated variants)
- optional PITI-ish add-ons (tax, insurance, HOA, PMI)
- optional extra principal per payment

## Run (local)

```bash
cd services/quote-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

## Run (Docker)

```bash
docker build -t nyra-quote-api .
docker run --rm -p 8080:8080 nyra-quote-api
```

## Example request

```bash
curl -X POST http://localhost:8080/quote \
  -H "Content-Type: application/json" \
  -d @sample/request.json
```

## Notes on “Excel formula conversion”

- You uploaded **.xls** (binary). In this environment we can reliably *convert* it to .xlsx, but full formula evaluation can be lossy when the converter rewrites long formulas.
- The approach here is therefore:
  1) implement mortgage math directly (PMT + amortization)
  2) provide **introspection tooling** to extract named ranges + formulas so we can hard-match any remaining “edge cell” outputs.

See `tools/extract_defined_names.py`.
