# Nyra Quote API - Enhanced Version 2.0

## What's New in Version 2.0

### Loan-Type-Specific Endpoints

The enhanced API now provides dedicated endpoints for each loan type:

- `/quote/conventional` - Conventional loans with PMI
- `/quote/fha` - FHA loans with MIP
- `/quote/va` - VA loans with funding fee
- `/quote/usda` - USDA loans with guarantee fee

### New Features

✅ **Unique Quote IDs** - Every quote gets a unique identifier (Q-XXXXXXXXXXXX)
✅ **Loan-Type Assumptions** - Detailed assumptions returned with each quote
✅ **Upfront Fee Calculations** - MIP, funding fees, guarantee fees calculated and financed
✅ **Smart PMI/MIP** - Automatic calculation based on LTV and loan type
✅ **Validation** - Loan-type-specific validation (LTV limits, credit scores, loan limits)
✅ **Comparison Endpoint** - Compare all loan types side-by-side
✅ **80%+ Test Coverage** - Comprehensive test suite included

## Quick Start

### Install Dependencies

```bash
cd bootstrap/services/quote-api
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Run Enhanced API

```bash
# Update Dockerfile or start script to use main_enhanced
uvicorn app.main_enhanced:app --reload --port 8080
```

### Test the API

```bash
# Health check
curl http://localhost:8080/health

# Get loan types
curl http://localhost:8080/quote/loan-types

# Conventional quote
curl -X POST http://localhost:8080/quote/conventional \
  -H "Content-Type: application/json" \
  -d @sample/loan-types/conventional.json

# FHA quote
curl -X POST http://localhost:8080/quote/fha \
  -H "Content-Type: application/json" \
  -d @sample/loan-types/fha.json

# VA quote
curl -X POST http://localhost:8080/quote/va \
  -H "Content-Type: application/json" \
  -d @sample/loan-types/va.json

# USDA quote
curl -X POST http://localhost:8080/quote/usda \
  -H "Content-Type: application/json" \
  -d @sample/loan-types/usda.json
```

## Run Tests

```bash
# Run all tests with coverage
pytest

# Run specific test file
pytest tests/services/quote-api/test_api_endpoints.py

# Run with verbose output
pytest -v

# Generate HTML coverage report
pytest --cov-report=html
```

## Architecture

```
bootstrap/services/quote-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # Original API (backward compatible)
│   ├── main_enhanced.py     # Enhanced API with loan types
│   ├── models.py            # Original models
│   ├── calc.py              # Core calculation logic
│   ├── loan_types.py        # Loan-type models and assumptions
│   └── loan_calc.py         # Loan-type-specific calculations
├── config/
│   ├── defaults.json
│   ├── excel_model.json
│   └── excel_compat_notes.md
├── sample/
│   ├── request.json         # Original sample
│   └── loan-types/          # Loan-type samples
│       ├── conventional.json
│       ├── conventional-with-pmi.json
│       ├── fha.json
│       ├── va.json
│       └── usda.json
├── tests/                   # Comprehensive test suite
│   ├── __init__.py
│   ├── conftest.py          # Test fixtures
│   ├── test_loan_types.py   # Model and assumption tests
│   ├── test_api_endpoints.py # Endpoint tests
│   └── test_calculations.py # Calculation tests
├── Dockerfile
├── requirements.txt
├── requirements-test.txt    # New: test dependencies
├── pytest.ini               # New: pytest configuration
├── README.md               # Original README
└── README_ENHANCED.md      # This file
```

## Sample Requests

### Conventional Loan (20% down, no PMI)

```json
{
  "loan_amount": 400000.0,
  "property_value": 500000.0,
  "annual_interest_rate": 0.07,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 720,
  "down_payment": 100000.0
}
```

**Response highlights:**
- `quote_id`: "Q-A3B5C7D9E1F3"
- `monthly_pmi_or_mip`: 0.0 (no PMI with 20% down)
- `upfront_fees`: 0.0
- `financed_amount`: 400000.0

### FHA Loan (3.5% down)

```json
{
  "loan_amount": 300000.0,
  "property_value": 310776.0,
  "annual_interest_rate": 0.065,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 620,
  "down_payment": 10776.0
}
```

**Response highlights:**
- `upfront_fees`: 5250.0 (1.75% MIP, financed)
- `financed_amount`: 305250.0
- `monthly_pmi_or_mip`: 137.50 (0.55% annual MIP)

### VA Loan (0% down)

```json
{
  "loan_amount": 450000.0,
  "property_value": 450000.0,
  "annual_interest_rate": 0.06,
  "term_years": 30,
  "start_date": "2024-01-01",
  "credit_score": 660,
  "down_payment": 0.0
}
```

**Response highlights:**
- `upfront_fees`: 9810.0 (2.18% funding fee, financed)
- `financed_amount`: 459810.0
- `monthly_pmi_or_mip`: 0.0 (no monthly insurance)

## Loan Type Characteristics

| Feature | Conventional | FHA | VA | USDA |
|---------|-------------|-----|----|----- |
| **Min Down** | 3% | 3.5% | 0% | 0% |
| **Max LTV** | 97% | 96.5% | 100% | 100% |
| **Min Credit** | 620 | 580 | 620 | 640 |
| **PMI/MIP** | PMI if LTV>80% | Always | None | Annual fee |
| **Upfront Fee** | None | 1.75% MIP | 2.18% funding | 1% guarantee |
| **Can Finance Fee** | N/A | Yes | Yes | Yes |
| **Loan Limit** | $766,550 | $498,257 | $766,550 | No limit |

## Testing

### Test Coverage

The test suite includes:

- ✅ **Model tests** - Loan assumptions, request validation
- ✅ **Calculation tests** - Payment calculations, amortization
- ✅ **API endpoint tests** - All endpoints, error handling
- ✅ **Integration tests** - End-to-end quote generation
- ✅ **Edge case tests** - Boundary conditions, validation errors

### Running Tests

```bash
# All tests
pytest

# Specific test class
pytest tests/services/quote-api/test_api_endpoints.py::TestConventionalEndpoint

# Specific test
pytest tests/services/quote-api/test_loan_types.py::TestLoanAssumptions::test_conventional_assumptions

# With coverage report
pytest --cov

# Stop on first failure
pytest -x

# Parallel execution (faster)
pytest -n auto
```

## API Documentation

Full API documentation available at:
- Interactive docs: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc
- Markdown docs: `docs/api/quote-engine.md`

## Migration from v1.0

The original endpoints remain backward compatible:

- `/quote` - Generic quote (original implementation)
- `/quote/compare` - Compare scenarios (original)

New loan-type endpoints provide enhanced functionality:

- More detailed assumptions
- Quote IDs for tracking
- Loan-type-specific validation
- Upfront fee calculations

## Next Steps

1. **Deploy Enhanced API**
   - Update Dockerfile to use `app.main_enhanced:app`
   - Deploy to staging environment
   - Run integration tests

2. **Frontend Integration**
   - Update UI to use new endpoints
   - Display loan-type-specific assumptions
   - Add quote ID tracking

3. **Production Readiness**
   - Add authentication (OAuth2/JWT)
   - Configure rate limiting
   - Set up monitoring/logging
   - Update CORS for production origins

4. **Additional Features**
   - Quote comparison UI
   - Save/retrieve quotes by ID
   - Email quote summaries
   - PDF quote generation

## Support

For issues or questions:
- Check `docs/api/quote-engine.md` for detailed API docs
- Review test files for usage examples
- See `config/excel_compat_notes.md` for Excel formula notes
