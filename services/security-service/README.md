# Nyra Security Service

Archon OS Security Architecture implementation.

## Features

### 1. CVE Tracking & Remediation
Automated scanning with pattern detection and remediation guidance.

### 2. Input Validation (Zod)
- Email, username, password validation
- File path sanitization
- SQL parameter validation
- Mortgage-specific: SSN, loan amount, credit score, interest rate

### 3. Path Traversal Protection
- Blocks unsafe path patterns
- Configurable allowed base paths

### 4. SQL Injection Prevention
- Parameterized query builder
- Table/column name sanitization

### 5. Claims-Based Authorization
- Fine-grained access control policies
- Mortgage-specific policies (loan officer, underwriter, PII access)

### 6. Rate Limiting
- Standard API and Auth rate limiting
- Mortgage-specific: Quote generation and Document upload limits

## Installation

```bash
cd services/security-service
pnpm install
pnpm build
```

## Usage

### Programmatic Usage

```typescript
import {
  CVETracker,
  InputValidator,
  PathValidator,
  SQLValidator,
  ClaimsAuthorizer,
  RateLimiter,
} from '@nyra/security-service';
```

## Integration with Archon OS

Use Archon workflows for automated security scanning and auditing.

```bash
# Example Archon workflow
archon workflow run security-audit
```

## Dependencies

- **zod**: Input validation schemas
- **express-rate-limit**: Rate limiting middleware
- **helmet**: Security headers
- **winston**: Structured logging
- **jsonwebtoken**: JWT token handling
- **bcrypt**: Password hashing

## License

MIT
