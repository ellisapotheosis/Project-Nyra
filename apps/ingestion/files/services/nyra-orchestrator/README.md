# Nyra Orchestrator (Policy Gate)

This is the **one** service that borrower-facing apps/tools can call.

It:
- enforces *logistics-only* communication
- validates consent + quiet hours (to be expanded)
- writes audit events
- dispatches allowed actions to n8n workflows (deterministic execution)

## Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 9000
```
