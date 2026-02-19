# Quote API

Migrate spreadsheet quoting logic into a scriptable API.

Endpoints:
- POST /quote
- POST /quote/compare
- GET /healthz

Run:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8088
```
