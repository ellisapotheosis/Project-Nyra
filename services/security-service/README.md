# Nyra Security Service

Claude Flow V3 Security Architecture implementation per ADR-010.

## Features

### 1. CVE Tracking & Remediation
- **CVE-2024-001**: Arbitrary Code Execution via unsafe eval
- **CVE-2024-002**: Command Injection via shell metacharacters
- **CVE-2024-003**: Prototype Pollution in config merging

Automated scanning with pattern detection and remediation guidance.

### 2. Input Validation (Zod)
- Email, username, password validation
- File path sanitization (no traversal)
- SQL parameter validation
- Shell argument validation
- JWT token validation
- Mortgage-specific: SSN, loan amount, credit score, interest rate

### 3. Path Traversal Protection
- Blocks `../`, `/etc`, `/proc`, null bytes
- Configurable allowed base paths
- Safe path joining and resolution

### 4. SQL Injection Prevention
- Detects UNION, OR 1=1, DROP TABLE patterns
- Parameterized query builder
- Table/column name sanitization
- WHERE clause validation

### 5. Claims-Based Authorization
- Fine-grained access control policies
- Role-based and attribute-based claims
- Time-based and IP-based conditions
- Mortgage-specific policies (loan officer, underwriter, PII access)

### 6. Rate Limiting
- Standard: 100 req/15min
- Auth: 5 req/15min (prevents brute force)
- API: 1000 req/hour
- Per-user limits
- Mortgage-specific: Quote generation (50/hour), Document upload (20/15min)

## Installation

```bash
cd services/security-service
pnpm install
pnpm build
```

## Usage

### CLI Tools

```bash
# CVE scan
pnpm run scan:cve [path]

# Full security scan
pnpm run scan:full [path]

# Security audit report
pnpm run audit
```

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

// 1. CVE Scanning
const cveTracker = new CVETracker();
const scanResult = await cveTracker.scanForCVEs('./src');
console.log(`Found ${scanResult.vulnerabilities.length} CVE patterns`);

// 2. Input Validation
const validator = new InputValidator();
const emailValidation = validator.validate('email', 'test@example.com');
if (emailValidation.success) {
  console.log('Valid email:', emailValidation.data);
}

// Register custom schema
validator.registerSchema('loan-id', z.string().uuid());

// 3. Path Validation
const pathValidator = new PathValidator(['/var/app/uploads']);
const pathCheck = pathValidator.validatePath(userInput, '/var/app/uploads');
if (pathCheck.valid) {
  // Safe to use pathCheck.safePath
}

// 4. SQL Validation
const sqlValidator = new SQLValidator();
const queryCheck = sqlValidator.validateQuery(userQuery);
if (queryCheck.valid) {
  // Safe to execute
}

// Build parameterized query
const { query, values } = sqlValidator.buildParameterizedQuery(
  'SELECT * FROM users WHERE email = :email AND active = :active',
  { email: 'user@example.com', active: true }
);

// 5. Claims-Based Authorization
const authorizer = new ClaimsAuthorizer();

// Define custom policy
authorizer.definePolicy({
  id: 'loan-officer-access',
  description: 'Loan officers can create quotes',
  resources: ['/api/quotes/*'],
  actions: ['create', 'read', 'update'],
  conditions: [
    {
      type: 'claim',
      claim: 'role',
      operator: 'equals',
      value: 'loan-officer',
    },
  ],
  effect: 'allow',
  priority: 60,
});

// Check authorization
const principal = {
  id: 'user-123',
  type: 'user',
  claims: [
    { type: 'role', value: 'loan-officer' },
    { type: 'compliance-certified', value: true },
  ],
};

const authResult = await authorizer.authorize(
  principal,
  '/api/quotes/create',
  'create'
);

if (authResult.allowed) {
  // Grant access
} else {
  console.log('Access denied:', authResult.reason);
}

// 6. Rate Limiting (Express middleware)
import express from 'express';

const app = express();

// Apply standard rate limiting
app.use(RateLimiter.standard());

// Protect authentication endpoints
app.post('/api/auth/login', RateLimiter.auth(), loginHandler);

// API rate limiting
app.use('/api/*', RateLimiter.api());

// Mortgage-specific rate limits
app.post('/api/quotes', RateLimiter.quoteGeneration(), quoteHandler);
app.post('/api/documents', RateLimiter.documentUpload(), uploadHandler);
```

## Express Integration Example

```typescript
import express from 'express';
import helmet from 'helmet';
import {
  RateLimiter,
  InputValidator,
  ClaimsAuthorizer,
  PathValidator,
} from '@nyra/security-service';

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
app.use(RateLimiter.standard());

// Initialize security services
const validator = new InputValidator();
const authorizer = new ClaimsAuthorizer();
const pathValidator = new PathValidator(['/var/app/uploads']);

// Validation middleware
app.post('/api/users', async (req, res) => {
  // Validate email
  const emailCheck = validator.validate('email', req.body.email);
  if (!emailCheck.success) {
    return res.status(400).json({ errors: emailCheck.errors });
  }

  // Validate password
  const passwordCheck = validator.validate('password', req.body.password);
  if (!passwordCheck.success) {
    return res.status(400).json({ errors: passwordCheck.errors });
  }

  // ... create user
});

// Authorization middleware
app.get('/api/mortgages/:id', async (req, res) => {
  const principal = (req as any).user; // From auth middleware

  const authCheck = await authorizer.authorize(
    principal,
    `/api/mortgages/${req.params.id}`,
    'read'
  );

  if (!authCheck.allowed) {
    return res.status(403).json({ error: authCheck.reason });
  }

  // ... fetch mortgage data
});

// File upload with path validation
app.post('/api/documents', async (req, res) => {
  const filename = req.body.filename;

  const pathCheck = pathValidator.validatePath(filename, '/var/app/uploads');
  if (!pathCheck.valid) {
    return res.status(400).json({ error: pathCheck.reason });
  }

  // ... save file to pathCheck.safePath
});
```

## CVE Details

### CVE-2024-001: Arbitrary Code Execution
**Severity**: Critical (CVSS 9.8)

Detects unsafe use of `eval()`, `new Function()`, `setTimeout(string)`.

**Remediation**: Use `vm.runInContext()` with timeout and sandboxing.

### CVE-2024-002: Command Injection
**Severity**: Critical (CVSS 9.1)

Detects `child_process.exec()`, template literals in commands, string concatenation.

**Remediation**: Use `execFile()` with explicit arguments array and `shell: false`.

### CVE-2024-003: Prototype Pollution
**Severity**: High (CVSS 7.5)

Detects `Object.assign()`, spread operators, `__proto__` access.

**Remediation**: Use validated deep merge blocking `__proto__`, `constructor`, `prototype`.

## Scripts

```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "scan:cve": "tsx src/cli/scan-cve.ts",
  "scan:full": "tsx src/cli/scan-full.ts"
}
```

## Testing

```bash
# Run tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Integration with Claude Flow

```bash
# Run security scan via Claude Flow CLI
npx @claude-flow/cli@latest security scan --depth full

# CVE-specific check
npx @claude-flow/cli@latest security cve --check CVE-2024-001

# Full audit
npx @claude-flow/cli@latest security audit
```

## Architecture

```
services/security-service/
├── src/
│   ├── cve/
│   │   └── cve-tracker.ts           # CVE scanning & tracking
│   ├── validation/
│   │   ├── input-validator.ts       # Zod-based validation
│   │   └── path-validator.ts        # Path traversal protection
│   ├── sql/
│   │   └── sql-validator.ts         # SQL injection prevention
│   ├── authorization/
│   │   └── claims-authorizer.ts     # Claims-based authz
│   ├── middleware/
│   │   └── rate-limiter.ts          # Rate limiting
│   ├── cli/
│   │   ├── scan-cve.ts              # CVE scanner CLI
│   │   └── scan-full.ts             # Full security scan CLI
│   ├── types/
│   │   └── security.types.ts        # TypeScript types
│   ├── utils/
│   │   └── logger.ts                # Winston logger
│   └── index.ts                     # Main exports
├── package.json
├── tsconfig.json
└── README.md
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
