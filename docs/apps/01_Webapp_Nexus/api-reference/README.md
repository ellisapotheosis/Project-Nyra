# Project Nyra - API Documentation

Comprehensive API documentation for all Project Nyra microservices.

## 📚 Available APIs

| Service             | Port | OpenAPI Spec                                                   | Description                                     |
| ------------------- | ---- | -------------------------------------------------------------- | ----------------------------------------------- |
| **Quote Engine**    | 8001 | [quote-engine-openapi.yaml](./quote-engine-openapi.yaml)       | Mortgage quote generation and rate calculations |
| **Campaign Engine** | 8002 | [campaign-engine-openapi.yaml](./campaign-engine-openapi.yaml) | Lead management and campaign automation         |
| **Orchestrator**    | 8003 | [orchestrator-openapi.yaml](./orchestrator-openapi.yaml)       | Workflow coordination and service orchestration |
| **Mem0**            | 8004 | [mem0-openapi.yaml](./mem0-openapi.yaml)                       | AI memory and context management                |

---

## 🚀 Quick Start Guide

### View Interactive Documentation

Use Swagger UI or Redoc to view beautiful, interactive API documentation.

**With Docker (Recommended):**

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/docs/quote-engine-openapi.yaml \
  -v $PWD/docs/api:/docs \
  swaggerapi/swagger-ui
```

Then open: http://localhost:8080

---

## 🧪 Testing APIs

### Generate a Mortgage Quote

```bash
curl -X POST http://localhost:8001/quote \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY>" \
  -d '{"loan_amount": 450000, "property_value": 550000, "credit_score": 750, "employment_status": "full-time"}'
```

### Create a Lead

```bash
curl -X POST http://localhost:8002/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY>" \
  -d '{"email": "john@example.com", "firstName": "John", "lastName": "Smith", "loanAmount": 450000}'
```

---

## 🔑 Authentication

All APIs require API Key authentication:

```http
X-API-Key: <API_KEY>-here
```

Generate dev key:

```bash
openssl rand -hex 32
```

---

## 📖 Code Examples

### JavaScript/Node.js

```javascript
const response = await fetch("http://localhost:8001/quote", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.NYRA_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    loan_amount: 450000,
    property_value: 550000,
    credit_score: 750,
    employment_status: "full-time",
  }),
});
const quote = await response.json();
console.log("Monthly payment:", quote.monthly_payment);
```

### Python

```python
import requests

response = requests.post('http://localhost:8001/quote',
  headers={'X-API-Key': os.getenv('NYRA_API_KEY')},
  json={'loan_amount': 450000, 'property_value': 550000, 'credit_score': 750})
quote = response.json()
print(f"Monthly payment: {quote['monthly_payment']}")
```

---

## 🤝 Support

- **Email**: api@ratehunter.com
- **Documentation**: https://docs.projectnyra.com

**© 2026 Project Nyra. All rights reserved.**
