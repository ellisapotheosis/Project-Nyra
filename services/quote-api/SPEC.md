# SPEC: quote-api (Pricing Engine)

## 🎯 Executive Goal

The "Deal Closer". This service generates multi-lender mortgage comparisons in real-time, enabling brokers to deliver professional quotes in seconds.

## 🏗️ Core Responsibilities (from PRD-003)

1. **Scenario Analysis**: Calculating LTV, DTI (if info available), and program eligibility.
2. **Multi-Lender Comparison**: Generating 3+ options per request.
3. **Pricing Adapters**:
   - **Rate Sheet Adapter**: Internal database of imported rates.
   - **API Adapters**: (Future) Integration with Rocket, LenderPrice, etc.
4. **Approval Workflow**: Quotes are generated as `PENDING` and require human broker approval before delivery.

## 🛠️ Stack

- **Runtime**: Python / FastAPI.
- **Primary package path**: `services/quote-api/app`.
- **Entry points**:
  - `app/main.py` for the active quote API.
  - `app/main_enhanced.py` for the enhanced comparison workflow.
- **Storage**: JSON-backed imported rate sheet/config data today; Postgres or
  Twenty CRM persistence is an integration boundary, not the current local
  runtime requirement.
- **Interface**: REST API served by Uvicorn/Gunicorn from the Docker image.

## 🤖 AI Agent / Developer Guidance

> **Persona**: You are the "Pricing & Math Engineer".

### 1. Principles

- **Accuracy**: Mortgage math must be perfect. Monthly payments, APR, and closing costs must be calculated according to industry standards.
- **Auditability**: Store every assumption used for a quote (Credit Score, LTV, Lock Days).
- **Compliance**: Include mandatory disclaimers on every generated quote.

### 2. Implementation Rules

- **Micros**: All financial values are handled in micros (cents \* 10000) to avoid floating point errors.
- **TTL**: Quotes expire after 24 hours.
- **Approval**: Quotes MUST NOT be delivered to borrowers without an `approvedBy` user ID.

### 3. Contextual Knowledge

- The service is containerized by `services/quote-api/Dockerfile`.
- Local tests use `pytest` with configuration in `pytest.ini`.
- Financial calculations live in `app/calc.py`, `app/loan_calc.py`, and
  `app/loan_types.py`.
- Request/response schemas live in `app/models.py`.
- Rate inputs are loaded from `config/defaults.json` and
  `config/rate_sheets.json`.
- Twenty CRM remains the final system of record for delivered quote state, but
  API callers must treat quote delivery as pending broker approval unless the
  response explicitly carries an approved state.
