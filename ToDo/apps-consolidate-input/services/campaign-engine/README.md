# Campaign Engine (FastAPI)

Loads Campaign DSL JSON and provides:
- listing campaigns
- rendering message templates with variables
- producing n8n payloads for execution

This service intentionally does NOT send SMS/email directly — it delegates to n8n so you keep deterministic workflows and easy integration.

## Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 9020
```
