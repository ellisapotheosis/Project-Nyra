# Refinement Phase: [Feature Name]

**SPARC Phase:** Refinement (TDD Implementation)
**Feature ID:** [Same ID from specification]
**Author:** [Agent or team name]
**Date:** [YYYY-MM-DD]
**Status:** In Progress | Code Review | Testing | Complete

---

## Implementation Overview

**Approach:** Test-Driven Development (Red → Green → Refactor)

**Technology Stack:**
- **Language:** [Python, JavaScript, TypeScript, etc.]
- **Framework:** [FastAPI, Express, Django, etc.]
- **Testing Framework:** [pytest, Jest, Mocha, etc.]
- **Test Coverage Tool:** [coverage.py, Istanbul, etc.]

---

## TDD Cycle Progress

### Cycle 1: [Feature Component 1]

#### Red (Write Failing Test)

**Test File:** `tests/test_webhook_validator.py`

```python
def test_validate_webhook_event_success():
    """Test successful webhook event validation."""
    # Arrange
    event = {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "contact.created",
        "timestamp": "2026-01-05T12:00:00Z",
        "data": {
            "contact_id": "123",
            "email": "test@example.com"
        }
    }
    validator = WebhookValidator()

    # Act
    result = validator.validate(event)

    # Assert
    assert result.is_valid == True
    assert result.errors == []
```

**Run Test:**
```bash
$ pytest tests/test_webhook_validator.py::test_validate_webhook_event_success
# Expected: FAILED (function not implemented yet)
```

---

#### Green (Make Test Pass)

**Implementation File:** `app/webhook_validator.py`

```python
from typing import Dict, List
from datetime import datetime
import uuid

class ValidationResult:
    def __init__(self, is_valid: bool, errors: List[str] = None):
        self.is_valid = is_valid
        self.errors = errors or []

class WebhookValidator:
    VALID_EVENT_TYPES = [
        "contact.created",
        "contact.updated",
        "deal.created",
        "deal.updated"
    ]

    def validate(self, event: Dict) -> ValidationResult:
        """Validate webhook event structure and data."""
        errors = []

        # Required fields check
        if not event.get("id"):
            errors.append("Field 'id' is required")
        elif not self._is_valid_uuid(event["id"]):
            errors.append("Field 'id' must be a valid UUID")

        if not event.get("type"):
            errors.append("Field 'type' is required")
        elif event["type"] not in self.VALID_EVENT_TYPES:
            errors.append(f"Invalid event type: {event['type']}")

        if not event.get("timestamp"):
            errors.append("Field 'timestamp' is required")
        elif not self._is_valid_timestamp(event["timestamp"]):
            errors.append("Field 'timestamp' must be ISO8601 format")

        if not event.get("data"):
            errors.append("Field 'data' is required")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors
        )

    def _is_valid_uuid(self, value: str) -> bool:
        try:
            uuid.UUID(value)
            return True
        except (ValueError, AttributeError):
            return False

    def _is_valid_timestamp(self, value: str) -> bool:
        try:
            datetime.fromisoformat(value.replace('Z', '+00:00'))
            return True
        except (ValueError, AttributeError):
            return False
```

**Run Test:**
```bash
$ pytest tests/test_webhook_validator.py::test_validate_webhook_event_success
# Expected: PASSED
```

---

#### Refactor (Improve Code Quality)

**Refactoring Applied:**
- Extract validation logic into separate methods
- Add type hints for better IDE support
- Improve error messages for clarity

**Refactored Code:**
```python
class WebhookValidator:
    # ... (previous code)

    def validate(self, event: Dict) -> ValidationResult:
        """Validate webhook event structure and data."""
        errors = []

        # Use helper methods for cleaner code
        errors.extend(self._validate_required_fields(event))
        errors.extend(self._validate_field_formats(event))
        errors.extend(self._validate_business_rules(event))

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors
        )

    def _validate_required_fields(self, event: Dict) -> List[str]:
        """Check for required fields."""
        errors = []
        required = ["id", "type", "timestamp", "data"]

        for field in required:
            if not event.get(field):
                errors.append(f"Field '{field}' is required")

        return errors

    def _validate_field_formats(self, event: Dict) -> List[str]:
        """Validate field formats."""
        errors = []

        if event.get("id") and not self._is_valid_uuid(event["id"]):
            errors.append("Field 'id' must be a valid UUID")

        if event.get("type") and event["type"] not in self.VALID_EVENT_TYPES:
            errors.append(f"Invalid event type: {event['type']}")

        if event.get("timestamp") and not self._is_valid_timestamp(event["timestamp"]):
            errors.append("Field 'timestamp' must be ISO8601 format")

        return errors

    def _validate_business_rules(self, event: Dict) -> List[str]:
        """Validate business-specific rules."""
        errors = []

        # Example: Deal value must be positive
        if event.get("type") == "deal.created":
            deal_value = event.get("data", {}).get("value")
            if deal_value is not None and deal_value < 0:
                errors.append("Deal value must be non-negative")

        return errors
```

**Run Test Again:**
```bash
$ pytest tests/test_webhook_validator.py::test_validate_webhook_event_success
# Expected: PASSED (still passing after refactoring)
```

---

### Cycle 2: [Feature Component 2]

[Repeat Red → Green → Refactor for next component]

---

## Test Suite

### Unit Tests

#### Test File 1: `tests/test_webhook_validator.py`

```python
import pytest
from app.webhook_validator import WebhookValidator, ValidationResult

class TestWebhookValidator:
    def setup_method(self):
        """Set up test fixtures."""
        self.validator = WebhookValidator()
        self.valid_event = {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "contact.created",
            "timestamp": "2026-01-05T12:00:00Z",
            "data": {"contact_id": "123"}
        }

    def test_validate_success(self):
        """Test successful validation."""
        result = self.validator.validate(self.valid_event)
        assert result.is_valid == True
        assert result.errors == []

    def test_validate_missing_id(self):
        """Test validation fails when id is missing."""
        event = {**self.valid_event}
        del event["id"]

        result = self.validator.validate(event)
        assert result.is_valid == False
        assert "Field 'id' is required" in result.errors

    def test_validate_invalid_uuid(self):
        """Test validation fails for invalid UUID."""
        event = {**self.valid_event, "id": "invalid-uuid"}

        result = self.validator.validate(event)
        assert result.is_valid == False
        assert "Field 'id' must be a valid UUID" in result.errors

    def test_validate_invalid_event_type(self):
        """Test validation fails for invalid event type."""
        event = {**self.valid_event, "type": "invalid.type"}

        result = self.validator.validate(event)
        assert result.is_valid == False
        assert "Invalid event type: invalid.type" in result.errors

    @pytest.mark.parametrize("invalid_timestamp", [
        "not-a-timestamp",
        "2026-13-01",  # Invalid month
        "2026-01-32",  # Invalid day
    ])
    def test_validate_invalid_timestamp(self, invalid_timestamp):
        """Test validation fails for invalid timestamps."""
        event = {**self.valid_event, "timestamp": invalid_timestamp}

        result = self.validator.validate(event)
        assert result.is_valid == False
        assert "Field 'timestamp' must be ISO8601 format" in result.errors
```

**Test Coverage:**
```bash
$ pytest tests/test_webhook_validator.py --cov=app.webhook_validator --cov-report=term-missing

---------- coverage: platform win32, python 3.11 -----------
Name                       Stmts   Miss  Cover   Missing
--------------------------------------------------------
app/webhook_validator.py      45      0   100%
--------------------------------------------------------
TOTAL                         45      0   100%
```

---

### Integration Tests

#### Test File 2: `tests/test_webhook_api.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestWebhookAPI:
    def test_webhook_endpoint_success(self):
        """Test successful webhook processing."""
        payload = {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "contact.created",
            "timestamp": "2026-01-05T12:00:00Z",
            "data": {"contact_id": "123"}
        }

        response = client.post("/webhook", json=payload)

        assert response.status_code == 200
        assert response.json()["status"] == "success"

    def test_webhook_endpoint_invalid_payload(self):
        """Test webhook endpoint with invalid payload."""
        payload = {"invalid": "data"}

        response = client.post("/webhook", json=payload)

        assert response.status_code == 400
        assert response.json()["status"] == "error"
        assert "VALIDATION_ERROR" in response.json()["error"]["code"]

    @pytest.mark.integration
    def test_webhook_n8n_integration(self, mock_n8n):
        """Test integration with n8n webhook."""
        # This test requires n8n mock or test instance
        payload = {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "contact.created",
            "timestamp": "2026-01-05T12:00:00Z",
            "data": {"contact_id": "123"}
        }

        response = client.post("/webhook", json=payload)

        assert response.status_code == 200
        # Verify n8n was called
        assert mock_n8n.was_called()
        assert mock_n8n.call_count == 1
```

---

### Performance Tests

#### Test File 3: `tests/test_webhook_performance.py`

```python
import pytest
import time
from concurrent.futures import ThreadPoolExecutor
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

class TestWebhookPerformance:
    @pytest.mark.performance
    def test_single_request_latency(self):
        """Test single request latency is under 200ms."""
        payload = {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "contact.created",
            "timestamp": "2026-01-05T12:00:00Z",
            "data": {"contact_id": "123"}
        }

        start = time.time()
        response = client.post("/webhook", json=payload)
        duration = (time.time() - start) * 1000  # Convert to ms

        assert response.status_code == 200
        assert duration < 200, f"Request took {duration}ms, expected < 200ms"

    @pytest.mark.performance
    def test_throughput_1000_concurrent(self):
        """Test throughput with 1000 concurrent requests."""
        payload = {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "type": "contact.created",
            "timestamp": "2026-01-05T12:00:00Z",
            "data": {"contact_id": "123"}
        }

        def make_request():
            return client.post("/webhook", json=payload)

        start = time.time()
        with ThreadPoolExecutor(max_workers=100) as executor:
            results = list(executor.map(lambda _: make_request(), range(1000)))
        duration = time.time() - start

        success_count = sum(1 for r in results if r.status_code == 200)
        throughput = 1000 / duration

        assert success_count >= 995  # 99.5% success rate
        assert throughput > 1000, f"Throughput: {throughput:.2f} req/s, expected > 1000 req/s"
```

---

## Code Quality Metrics

### Test Coverage

**Target:** ≥ 85% coverage

**Current Coverage:**
```bash
$ pytest --cov=app --cov-report=term-missing

---------- coverage: platform win32, python 3.11 -----------
Name                          Stmts   Miss  Cover   Missing
-----------------------------------------------------------
app/__init__.py                   0      0   100%
app/main.py                      25      2    92%   45-46
app/webhook_validator.py         45      0   100%
app/webhook_transformer.py       38      3    92%   67-69
app/n8n_publisher.py             32      4    88%   78-81
-----------------------------------------------------------
TOTAL                           140      9    94%
```

**Status:** ✅ Exceeds target (94% coverage)

---

### Linting

**Tool:** [pylint, eslint, etc.]

```bash
$ pylint app/

--------------------------------------------------------------------
Your code has been rated at 9.2/10 (previous run: 8.5/10, +0.70)
```

**Issues Fixed:**
- Removed unused imports
- Fixed line length violations
- Added docstrings to all functions

---

### Type Checking

**Tool:** [mypy, TypeScript, etc.]

```bash
$ mypy app/

Success: no issues found in 5 source files
```

**Status:** ✅ No type errors

---

## Refactoring Log

### Refactoring 1: Extract Validation Logic

**Date:** 2026-01-05
**Reason:** Reduce complexity of validation method
**Changes:**
- Split `validate()` into `_validate_required_fields()`, `_validate_field_formats()`, `_validate_business_rules()`
- Improved testability

**Before:**
- Cyclomatic Complexity: 12
- Lines of Code: 45

**After:**
- Cyclomatic Complexity: 4 (per method)
- Lines of Code: 55 (more readable)

**Tests:** All tests still passing after refactoring

---

### Refactoring 2: Introduce Retry Decorator

**Date:** 2026-01-05
**Reason:** DRY principle - retry logic used in multiple places
**Changes:**
- Created `@retry()` decorator
- Applied to all n8n API calls

**Before:**
```python
def publish_to_n8n(data):
    for i in range(MAX_RETRIES):
        try:
            return n8n_client.post(data)
        except NetworkError:
            if i == MAX_RETRIES - 1:
                raise
            time.sleep(2 ** i)
```

**After:**
```python
@retry(max_attempts=3, backoff_factor=2)
def publish_to_n8n(data):
    return n8n_client.post(data)
```

**Tests:** All tests still passing, added tests for decorator

---

## Implementation Status

### Component Checklist

- [x] **WebhookValidator**
  - [x] Unit tests (10 tests)
  - [x] Code coverage: 100%
  - [x] Refactored for clarity

- [x] **WebhookTransformer**
  - [x] Unit tests (8 tests)
  - [x] Code coverage: 92%
  - [x] Edge cases handled

- [x] **N8nPublisher**
  - [x] Unit tests (6 tests)
  - [x] Integration tests (3 tests)
  - [x] Code coverage: 88%
  - [x] Retry logic implemented

- [x] **API Endpoints**
  - [x] Integration tests (5 tests)
  - [x] Performance tests (2 tests)
  - [x] Error handling complete

- [ ] **Monitoring**
  - [ ] Metrics instrumentation
  - [ ] Logging added
  - [ ] Alerts configured

---

## Known Issues

### Issue 1: [Issue Description]

**Severity:** High | Medium | Low
**Status:** Open | In Progress | Resolved

**Description:** [Detailed description of the issue]

**Reproduction Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:** [What should happen]

**Actual Behavior:** [What actually happens]

**Workaround:** [Temporary solution if available]

**Fix Plan:** [How it will be fixed]

---

## Performance Benchmarks

### Benchmark Results

| Metric                | Target    | Actual    | Status |
|-----------------------|-----------|-----------|--------|
| API Latency (p95)     | < 200ms   | 145ms     | ✅     |
| API Latency (p99)     | < 500ms   | 287ms     | ✅     |
| Throughput            | > 1000/s  | 1250/s    | ✅     |
| Memory Usage          | < 512MB   | 380MB     | ✅     |
| CPU Usage (avg)       | < 50%     | 35%       | ✅     |

**Load Test Setup:**
- Duration: 5 minutes
- Concurrent Users: 100
- Ramp-Up Time: 30 seconds

---

## Security Scan

**Tool:** [Bandit, Snyk, npm audit, etc.]

```bash
$ bandit -r app/

Run started:2026-01-05 12:00:00

Test results:
  No issues identified.

Code scanned:
  Total lines of code: 450
  Total lines skipped (#nosec): 0
```

**Status:** ✅ No security vulnerabilities found

---

## Documentation Updates

### Updated Documentation

- [x] API reference (`docs/api/webhook.md`)
- [x] Architecture diagram (`docs/sparc/architecture/twenty-bridge-webhook.md`)
- [x] Deployment guide (`docs/deployment/twenty-bridge.md`)
- [ ] User guide (pending)
- [ ] Troubleshooting runbook (pending)

---

## Code Review Checklist

### Pre-Review

- [x] All tests passing
- [x] Code coverage ≥ 85%
- [x] Linting passed
- [x] Type checking passed
- [x] Security scan passed
- [x] Performance benchmarks met
- [x] Documentation updated

### Review Items

- [ ] Code follows project style guide
- [ ] Naming conventions adhered to
- [ ] Error handling comprehensive
- [ ] Logging appropriate
- [ ] No hardcoded secrets
- [ ] Comments clear and helpful
- [ ] Tests cover edge cases

### Reviewer Feedback

**Reviewer:** [Name]
**Date:** [YYYY-MM-DD]

**Comments:**
- [Comment 1]
- [Comment 2]

**Action Items:**
- [Action 1]
- [Action 2]

---

## Next Steps

1. **Address code review feedback** - Fix identified issues
2. **Complete monitoring** - Add metrics and alerts
3. **Write user documentation** - Create user guide
4. **Move to Completion Phase** - Integration testing and deployment

---

## References

- [TDD Best Practices](https://example.com)
- [Testing Framework Documentation](https://example.com)
- [Performance Testing Guide](https://example.com)

---

## Approval

**Code Review Approved By:**
- [ ] Technical Lead: [Name]
- [ ] Senior Developer: [Name]

**Approval Date:** [YYYY-MM-DD]

**Next Phase:** Completion

---

**Template Version:** 1.0.0
**Last Updated:** 2026-01-05
