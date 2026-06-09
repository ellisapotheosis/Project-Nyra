# Quote Engine API Documentation

## Overview

The Quote Engine API provides mortgage quote calculations for multiple loan types with support for:
- **Conventional** loans (conforming, with PMI)
- **FHA** loans (government-insured, lower down payment)
- **VA** loans (veterans, no down payment, no PMI)
- **USDA** loans (rural development, no down payment)

## Base URL

```
http://localhost:8080
```

## Authentication

Currently no authentication required (add OAuth2/JWT for production).

## Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "ok": true,
  "version": "2.0.0",
  "service": "nyra-quote-api"
}
```

---

### Get Loan Types

```http
GET /quote/loan-types
```

Get information about available loan types and their requirements.

**Response:**
```json
{
  "loan_types": [
    {
      "type": "conventional",
      "name": "Conventional Loan",
      "description": "Standard conforming loan with PMI if LTV > 80%",
      "min_down_payment": "3%",
      "max_ltv": "97%",
      "min_credit_score": 620,
      "pmi_required": "Yes, if LTV > 80%"
    },
    // ... other loan types
  ]
}
```

---

### Conventional Loan Quote

```http
POST /quote/conventional
```

Get a quote for a conventional mortgage loan.

**Request Body:**
```json
{
  "loan_amount": 400000.0,
  "property_value": 500000.0,
  "annual_interest_rate": 0.07,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 720,
  "down_payment": 100000.0,
  "annual_property_tax": 6000.0,
  "annual_home_insurance": 1200.0,
  "monthly_hoa": 100.0,
  "extra_principal": 0.0,
  "compounding": "Monthly",
  "payment_frequency": "Monthly",
  "include_schedule": false
}
```

**Response:**
```json
{
  "quote_id": "Q-A3B5C7D9E1F3",
  "inputs": { /* echoed request */ },
  "summary": {
    "quote_id": "Q-A3B5C7D9E1F3",
    "loan_type": "conventional",
    "base_loan_amount": 400000.0,
    "upfront_fees": 0.0,
    "financed_amount": 400000.0,
    "periodic_payment_pi": 2661.21,
    "monthly_pmi_or_mip": 0.0,
    "periodic_payment_piti": 3361.21,
    "periodic_interest_rate": 0.005833,
    "annual_interest_rate": 0.07,
    "periods_per_year": 12,
    "number_of_payments": 360,
    "term_years": 30,
    "total_interest": 558035.60,
    "total_pmi_or_mip": 0.0,
    "total_paid": 1210035.60,
    "payoff_date": "2054-01-01",
    "ltv": 1.0,
    "down_payment": 100000.0,
    "property_value": 500000.0,
    "credit_score": 720,
    "assumptions": {
      "loan_type": "conventional",
      "requires_pmi": true,
      "max_ltv": 0.97,
      "min_credit_score": 620,
      "conforming_limit": 766550.0,
      "pmi_cancellation_ltv": 0.78
    }
  },
  "schedule": null,
  "assumptions": { /* same as summary.assumptions */ }
}
```

**Key Fields:**
- `quote_id`: Unique identifier for this quote
- `periodic_payment_pi`: Principal + Interest payment
- `monthly_pmi_or_mip`: PMI amount (if LTV > 80%)
- `periodic_payment_piti`: Total payment including taxes, insurance, HOA
- `total_interest`: Total interest paid over life of loan
- `ltv`: Loan-to-value ratio

---

### FHA Loan Quote

```http
POST /quote/fha
```

Get a quote for an FHA mortgage loan.

**Request Body:**
```json
{
  "loan_amount": 300000.0,
  "property_value": 310776.0,
  "annual_interest_rate": 0.065,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 620,
  "down_payment": 10776.0,
  "annual_property_tax": 4500.0,
  "annual_home_insurance": 900.0,
  "include_schedule": false
}
```

**Response Highlights:**
```json
{
  "summary": {
    "loan_type": "fha",
    "upfront_fees": 5250.0,        // 1.75% upfront MIP
    "financed_amount": 305250.0,   // Base + upfront MIP
    "monthly_pmi_or_mip": 137.50,  // 0.55% annual MIP
    "assumptions": {
      "upfront_fee_rate": 0.0175,
      "annual_insurance_rate": 0.0055,
      "can_finance_upfront_fee": true,
      "fha_loan_limit": 498257.0
    }
  }
}
```

---

### VA Loan Quote

```http
POST /quote/va
```

Get a quote for a VA mortgage loan.

**Request Body:**
```json
{
  "loan_amount": 450000.0,
  "property_value": 450000.0,
  "annual_interest_rate": 0.06,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 660,
  "down_payment": 0.0,
  "annual_property_tax": 5400.0,
  "annual_home_insurance": 1080.0,
  "include_schedule": false
}
```

**Response Highlights:**
```json
{
  "summary": {
    "loan_type": "va",
    "upfront_fees": 9810.0,        // 2.18% funding fee
    "financed_amount": 459810.0,   // Base + funding fee
    "monthly_pmi_or_mip": 0.0,     // No monthly insurance
    "assumptions": {
      "funding_fee_rate": 0.0218,
      "requires_pmi": false,
      "max_ltv": 1.0,
      "va_loan_limit": 766550.0
    }
  }
}
```

---

### USDA Loan Quote

```http
POST /quote/usda
```

Get a quote for a USDA mortgage loan.

**Request Body:**
```json
{
  "loan_amount": 250000.0,
  "property_value": 250000.0,
  "annual_interest_rate": 0.065,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 660,
  "down_payment": 0.0,
  "annual_property_tax": 3000.0,
  "annual_home_insurance": 600.0,
  "include_schedule": false
}
```

**Response Highlights:**
```json
{
  "summary": {
    "loan_type": "usda",
    "upfront_fees": 2500.0,        // 1% guarantee fee
    "financed_amount": 252500.0,   // Base + guarantee fee
    "monthly_pmi_or_mip": 72.92,   // 0.35% annual fee
    "assumptions": {
      "upfront_fee_rate": 0.01,
      "annual_insurance_rate": 0.0035,
      "can_finance_upfront_fee": true
    }
  }
}
```

---

### Compare Loan Types

```http
POST /quote/compare-loan-types
```

Compare all loan types for the same property and borrower.

**Request Body:**
Same as individual loan type requests.

**Response:**
```json
{
  "comparison": {
    "conventional": {
      "available": true,
      "quote_id": "Q-XXX",
      "monthly_payment": 3361.21,
      "total_paid": 1210035.60,
      "upfront_fees": 0.0,
      "financed_amount": 400000.0,
      "summary": { /* full summary */ }
    },
    "fha": {
      "available": true,
      "quote_id": "Q-YYY",
      "monthly_payment": 2145.50,
      "total_paid": 800000.00,
      "upfront_fees": 5250.0,
      "financed_amount": 305250.0
    },
    // ... va, usda
  },
  "property_value": 500000.0,
  "loan_amount": 400000.0,
  "credit_score": 720
}
```

---

## Request Parameters

### Common Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `loan_amount` | float | Yes | Base loan amount before fees |
| `property_value` | float | Yes | Property appraised value |
| `annual_interest_rate` | float | Yes | Annual interest rate as decimal (0.07 = 7%) |
| `term_years` | integer | Yes | Loan term in years (10-50) |
| `start_date` | string | Yes | First payment date (YYYY-MM-DD) |
| `credit_score` | integer | Yes | Borrower credit score (300-850) |
| `down_payment` | float | Yes | Down payment amount |
| `annual_property_tax` | float | No | Annual property taxes (default: 0) |
| `annual_home_insurance` | float | No | Annual home insurance (default: 0) |
| `monthly_hoa` | float | No | Monthly HOA fees (default: 0) |
| `extra_principal` | float | No | Extra principal per payment (default: 0) |
| `compounding` | string | No | "Monthly" or "Semi-Annually" (default: "Monthly") |
| `payment_frequency` | string | No | "Monthly", "Semi-Monthly", "Bi-Weekly", "Weekly" (default: "Monthly") |
| `include_schedule` | boolean | No | Include amortization schedule (default: false) |

---

## Loan Type Requirements

### Conventional

- **Minimum down payment**: 3% (97% LTV max)
- **Minimum credit score**: 620
- **PMI required**: Yes, if LTV > 80%
- **PMI cancels**: At 78% LTV
- **Conforming limit**: $766,550 (2024)

### FHA

- **Minimum down payment**: 3.5% (96.5% LTV max)
- **Minimum credit score**: 580 (500-579 requires 10% down)
- **Upfront MIP**: 1.75% of loan amount (can be financed)
- **Annual MIP**: 0.55% (varies by loan amount, LTV, term)
- **FHA limit**: $498,257 (2024, varies by county)

### VA

- **Minimum down payment**: 0% (100% LTV)
- **Minimum credit score**: 620 (lender overlay; VA has no minimum)
- **Funding fee**: 2.18% for first-time use, 0% down (can be financed)
- **PMI/MIP**: None
- **VA limit**: $766,550 (2024, no limit with full entitlement)

### USDA

- **Minimum down payment**: 0% (100% LTV)
- **Minimum credit score**: 640
- **Upfront guarantee fee**: 1% (can be financed)
- **Annual fee**: 0.35%
- **Property requirement**: Must be in eligible rural area
- **Income limits**: Apply (not validated by API)

---

## Error Responses

### 400 Bad Request

Validation error or loan requirement not met.

```json
{
  "detail": "CONVENTIONAL loans require at least 3.0% down payment. Current LTV: 98.0%"
}
```

### 422 Unprocessable Entity

Invalid request format or missing required fields.

```json
{
  "detail": [
    {
      "loc": ["body", "loan_amount"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Example Requests

### Conventional with PMI (10% down)

```bash
curl -X POST http://localhost:8080/quote/conventional \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 450000,
    "property_value": 500000,
    "annual_interest_rate": 0.07,
    "term_years": 30,
    "start_date": "2024-01-01",
    "credit_score": 720,
    "down_payment": 50000,
    "annual_property_tax": 6000,
    "annual_home_insurance": 1200,
    "monthly_hoa": 100
  }'
```

### FHA Minimum Down (3.5%)

```bash
curl -X POST http://localhost:8080/quote/fha \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 300000,
    "property_value": 310776,
    "annual_interest_rate": 0.065,
    "term_years": 30,
    "start_date": "2024-01-01",
    "credit_score": 620,
    "down_payment": 10776,
    "annual_property_tax": 4500,
    "annual_home_insurance": 900
  }'
```

### VA Zero Down

```bash
curl -X POST http://localhost:8080/quote/va \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 450000,
    "property_value": 450000,
    "annual_interest_rate": 0.06,
    "term_years": 30,
    "start_date": "2024-01-01",
    "credit_score": 660,
    "down_payment": 0,
    "annual_property_tax": 5400,
    "annual_home_insurance": 1080
  }'
```

---

## Testing

Run the test suite:

```bash
cd bootstrap/services/quote-api
pip install -r requirements-test.txt
pytest
```

Generate coverage report:

```bash
pytest --cov-report=html
open htmlcov/index.html
```

---

## Deployment

### Local Development

```bash
cd bootstrap/services/quote-api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main_enhanced:app --reload --port 8080
```

### Docker

```bash
docker build -t nyra-quote-api .
docker run -p 8080:8080 nyra-quote-api
```

### Production

1. Update `app/main_enhanced.py` to use `app.main_enhanced:app`
2. Configure CORS for specific origins
3. Add authentication middleware
4. Use environment variables for configuration
5. Deploy with gunicorn/uvicorn workers

---

## Notes

- All monetary amounts in USD
- Interest rates as decimals (0.07 = 7%)
- Dates in ISO 8601 format (YYYY-MM-DD)
- Quote IDs are unique and start with "Q-"
- Loan limits are 2024 values (update annually)
- PMI/MIP rates are averages (actual rates vary by lender)
