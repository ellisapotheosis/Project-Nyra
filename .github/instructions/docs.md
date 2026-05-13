---
description: Documentation writing standards
applyTo:
  - "docs/**/*.md"
  - "**/README.md"
  - "**/*.mdx"
stack: Markdown, Mermaid, JSDoc, OpenAPI
---

# Documentation - Writing Standards

## Scope

This file applies to all documentation:

- Project documentation (`docs/`)
- README files (`**/README.md`)
- Component guides (`**/CLAUDE.md`)
- API documentation
- Architecture diagrams (Mermaid)

## Documentation Types

### 1. README Files

Every package, app, and service should have a README.md with:

- Brief description (1-2 sentences)
- Features list
- Installation instructions
- Usage examples
- API reference (if applicable)
- Contributing guidelines
- License

**Template:**

```markdown
# Project/Component Name

Brief description of what this does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Usage

\`\`\`typescript
import { Component } from './component';

const result = Component.doSomething();
\`\`\`

## API Reference

### `functionName(param: Type): ReturnType`

Description of what the function does.

**Parameters:**

- `param` (Type): Parameter description

**Returns:**

- (ReturnType): Return value description

**Example:**
\`\`\`typescript
const result = functionName('value');
console.log(result);
\`\`\`

## Configuration

| Option    | Type   | Default     | Description        |
| --------- | ------ | ----------- | ------------------ |
| `option1` | string | `'default'` | Option description |
| `option2` | number | `100`       | Option description |

## Development

\`\`\`bash

# Development mode

pnpm dev

# Run tests

pnpm test

# Build

pnpm build
\`\`\`

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT
```

### 2. Architecture Documentation

Use Mermaid diagrams for visual representation.

**System Architecture:**

```markdown
## System Architecture

\`\`\`mermaid
graph TB
subgraph "Client Layer"
Web[Web App]
Mobile[Mobile App]
end

    subgraph "API Gateway"
        Gateway[API Gateway]
        Auth[Auth Service]
    end

    subgraph "Microservices"
        UserSvc[User Service]
        QuoteSvc[Quote Service]
        DocSvc[Document Service]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
        S3[(S3 Storage)]
    end

    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Gateway --> UserSvc
    Gateway --> QuoteSvc
    Gateway --> DocSvc

    UserSvc --> PG
    QuoteSvc --> PG
    DocSvc --> S3

    UserSvc --> Redis
    QuoteSvc --> Redis

\`\`\`
```

**Sequence Diagram:**

```markdown
## Authentication Flow

\`\`\`mermaid
sequenceDiagram
participant Client
participant Gateway
participant Auth
participant DB

    Client->>Gateway: POST /login {email, password}
    Gateway->>Auth: Validate credentials
    Auth->>DB: Query user
    DB-->>Auth: User data
    Auth->>Auth: Verify password
    Auth-->>Gateway: JWT token
    Gateway-->>Client: {token, user}

    Note over Client,Gateway: Subsequent requests include token

    Client->>Gateway: GET /api/quotes (+ token)
    Gateway->>Auth: Verify token
    Auth-->>Gateway: Valid
    Gateway-->>Client: Quote data

\`\`\`
```

**Entity Relationship Diagram:**

```markdown
## Database Schema

\`\`\`mermaid
erDiagram
User ||--o{ Quote : creates
User ||--o{ Application : submits
Application ||--o{ Document : contains
Quote ||--o{ Application : includes

    User {
        string id PK
        string email UK
        string name
        enum role
        datetime created_at
    }

    Quote {
        string id PK
        string user_id FK
        float loan_amount
        float interest_rate
        int term_years
        float monthly_payment
        datetime created_at
    }

    Application {
        string id PK
        string user_id FK
        string quote_id FK
        enum status
        datetime submitted_at
    }

    Document {
        string id PK
        string application_id FK
        string type
        string url
        datetime uploaded_at
    }

\`\`\`
```

### 3. API Documentation

Document all REST APIs with clear examples.

**Format:**

```markdown
## API Endpoints

### Create Quote

Create a new mortgage quote calculation.

**Endpoint:** `POST /api/v1/quotes`

**Authentication:** Required (Bearer token)

**Request Body:**

\`\`\`json
{
"loanAmount": 300000,
"interestRate": 3.5,
"termYears": 30
}
\`\`\`

**Request Schema:**

| Field          | Type   | Required | Constraints | Description              |
| -------------- | ------ | -------- | ----------- | ------------------------ |
| `loanAmount`   | number | Yes      | > 0         | Loan amount in dollars   |
| `interestRate` | number | Yes      | > 0, ≤ 100  | Annual interest rate (%) |
| `termYears`    | number | Yes      | > 0, ≤ 40   | Loan term in years       |

**Response (201 Created):**

\`\`\`json
{
"id": "quote_123",
"loanAmount": 300000,
"interestRate": 3.5,
"termYears": 30,
"monthlyPayment": 1347.13,
"totalPayment": 484966.80,
"totalInterest": 184966.80,
"createdAt": "2026-01-18T10:30:00Z"
}
\`\`\`

**Error Responses:**

| Status Code               | Description           | Example                                    |
| ------------------------- | --------------------- | ------------------------------------------ |
| 400 Bad Request           | Invalid input         | `{"error": "loanAmount must be positive"}` |
| 401 Unauthorized          | Missing/invalid token | `{"error": "Invalid token"}`               |
| 500 Internal Server Error | Server error          | `{"error": "Internal server error"}`       |

**cURL Example:**

\`\`\`bash
curl -X POST https://api.nyra.com/api/v1/quotes \
 -H "Content-Type: application/json" \
 -d '{
"loanAmount": 300000,
"interestRate": 3.5,
"termYears": 30
}'
\`\`\`

**TypeScript Example:**

\`\`\`typescript
const response = await fetch('https://api.nyra.com/api/v1/quotes', {
method: 'POST',
headers: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({
loanAmount: 300000,
interestRate: 3.5,
termYears: 30,
}),
});

const quote = await response.json();
console.log(quote);
\`\`\`
```

### 4. Code Documentation (JSDoc/TSDoc)

**Function Documentation:**

````typescript
/**
 * Calculate the monthly mortgage payment using the standard formula.
 *
 * Uses the formula: M = P[r(1+r)^n]/[(1+r)^n-1]
 * where M is monthly payment, P is principal, r is monthly rate, n is number of payments.
 *
 * @param params - Loan parameters
 * @param params.principal - Total loan amount in dollars
 * @param params.annualRate - Annual interest rate as a percentage (e.g., 3.5 for 3.5%)
 * @param params.termYears - Loan term in years
 *
 * @returns Monthly payment amount rounded to 2 decimal places
 *
 * @throws {Error} If principal is not positive
 * @throws {Error} If annual rate is negative or exceeds 100
 * @throws {Error} If term years is not positive
 *
 * @example
 * ```typescript
 * const payment = calculateMonthlyPayment({
 *   principal: 300000,
 *   annualRate: 3.5,
 *   termYears: 30
 * });
 * console.log(payment); // 1347.13
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Mortgage_calculator} for formula details
 */
export function calculateMonthlyPayment(params: {
  principal: number;
  annualRate: number;
  termYears: number;
}): number {
  // Implementation...
}
````

**Class Documentation:**

````typescript
/**
 * Service for managing user accounts and authentication.
 *
 * Provides methods for user registration, login, password management,
 * and profile updates. All methods are async and return Promises.
 *
 * @example
 * ```typescript
 * const userService = new UserService();
 *
 * // Create new user
 * const user = await userService.create({
 *   email: 'user@example.com',
 *   password: 'secure_password',
 *   name: 'John Doe'
 * });
 *
 * // Authenticate user
 * const session = await userService.login({
 *   email: 'user@example.com',
 *   password: 'secure_password'
 * });
 * ```
 */
export class UserService {
  /**
   * Create a new user account.
   *
   * @param input - User registration data
   * @returns Newly created user (password excluded)
   * @throws {AppError} If email already exists (409)
   */
  async create(input: CreateUserInput): Promise<User> {
    // Implementation...
  }
}
````

### 5. ADR (Architecture Decision Records)

Document important architectural decisions.

**Template:**

```markdown
# ADR-001: Use Prisma ORM for Database Access

## Status

Accepted

## Date

2026-01-15

## Context

We need to choose an ORM/database access layer for our Node.js microservices.
The system will use PostgreSQL as the primary database.

Options considered:

1. Prisma
2. TypeORM
3. Sequelize
4. Knex.js with raw SQL

## Decision

We will use Prisma as our ORM.

## Reasoning

**Pros:**

- Type-safe database client generated from schema
- Excellent TypeScript support
- Migration system built-in
- Great developer experience with Prisma Studio
- Active development and community
- Performance optimizations (connection pooling, query batching)

**Cons:**

- Relatively newer than TypeORM/Sequelize
- Some advanced SQL features require raw queries
- Schema must be defined in Prisma format

**Why not alternatives:**

- TypeORM: Decorator-based, less intuitive for our team
- Sequelize: Older, not TypeScript-first
- Knex.js: Too low-level, more manual work

## Consequences

**Positive:**

- Faster development with type safety
- Reduced runtime errors from type checking
- Easy database schema evolution
- Better onboarding for new developers

**Negative:**

- Learning curve for team members unfamiliar with Prisma
- Need to learn Prisma-specific query patterns
- Vendor lock-in to some degree

## Implementation

1. Add Prisma to shared `packages/database`
2. Define schema in `schema.prisma`
3. Create migrations for existing database
4. Update all services to use Prisma client
5. Document Prisma patterns in service templates

## Notes

- Review decision in 12 months
- Monitor for any significant issues or limitations
- Keep track of community adoption and support
```

### 6. Changelog

Maintain a CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/).

**Format:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New feature X
- Support for Y

### Changed

- Improved performance of Z

### Deprecated

- Old API endpoint /v1/old

### Removed

- Legacy feature A

### Fixed

- Bug in component B
- Security vulnerability CVE-2026-XXXXX

### Security

- Updated dependency X to patch vulnerability

## [1.2.0] - 2026-01-15

### Added

- Quote calculation API endpoint
- User authentication with JWT
- Rate comparison engine

### Changed

- Upgraded Next.js to version 14
- Improved database query performance

### Fixed

- Login redirect issue
- Memory leak in WebSocket handler

## [1.1.0] - 2026-01-01

...

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/releases/tag/v1.1.0
```

## Writing Style Guidelines

### General Principles

1. **Be Clear and Concise:** Avoid jargon, explain acronyms
2. **Use Active Voice:** "The function returns..." not "The value is returned..."
3. **Be Consistent:** Use same terms throughout documentation
4. **Provide Examples:** Show, don't just tell
5. **Keep Updated:** Update docs with code changes

### Formatting

**Headings:**

- Use ATX-style headers (`#`, `##`, `###`)
- One H1 per document
- Hierarchical structure (don't skip levels)

**Code Blocks:**

- Always specify language for syntax highlighting
- Keep examples concise but complete
- Show both input and expected output

**Links:**

- Use descriptive link text (not "click here")
- Link to relevant internal documentation
- Check for broken links regularly

**Lists:**

- Use bullet points for unordered items
- Use numbered lists for sequential steps
- Keep list items parallel in structure

**Tables:**

- Use tables for structured data
- Include headers
- Align columns for readability

### Common Sections

**README Sections (in order):**

1. Title and description
2. Badges (build status, coverage, etc.)
3. Table of contents (for long docs)
4. Features
5. Installation
6. Quick start / Usage
7. API Reference
8. Configuration
9. Examples
10. Development
11. Testing
12. Deployment
13. Contributing
14. License
15. Acknowledgments

**API Documentation Sections:**

1. Authentication
2. Base URL and versioning
3. Endpoints (grouped by resource)
4. Request/response formats
5. Error codes
6. Rate limiting
7. Examples (cURL, code)

## Tools and Automation

### Markdown Linters

Use markdownlint for consistency:

```json
// .markdownlint.json
{
  "default": true,
  "MD013": false, // Line length
  "MD033": false, // Inline HTML
  "MD041": false // First line heading
}
```

### Link Checking

Regular link validation:

```bash
# Install markdown-link-check
npm install -g markdown-link-check

# Check links
markdown-link-check docs/**/*.md
```

### Documentation Generation

Generate API docs from code:

```bash
# TypeScript/JSDoc
npx typedoc --out docs/api src/

# OpenAPI/Swagger
npx swagger-cli bundle -o docs/openapi.yaml api/openapi/*.yaml
```

## Key Reminders

1. **Update docs with code changes** (same PR)
2. **Include code examples** for all public APIs
3. **Use Mermaid diagrams** for visual explanations
4. **Document "why" not just "what"**
5. **Keep language simple and clear**
6. **Test all code examples** before committing
7. **Link related documentation** for context
8. **Version your documentation** with the code
9. **Get docs reviewed** like code
10. **Make docs discoverable** (README links, table of contents)

---

**Last Updated:** 2026-01-18
