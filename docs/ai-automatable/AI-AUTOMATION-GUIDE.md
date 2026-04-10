# AI Automation Guide: What Claude Can (and Cannot) Do

This guide clarifies which development tasks can be automated with Claude Code, which require swarm coordination, which need human oversight, and which must be done manually.

---

## 1. Claude Code Fully-Automatable Tasks

These tasks are 100% automatable with Claude Code. Claude handles start-to-finish without human intervention.

### Code Generation
- **APIs & Endpoints**: Generate REST/GraphQL endpoints with validation, error handling, middleware
- **Components & Utilities**: Create reusable functions, classes, React components with types
- **Boilerplate**: Generate configuration files, package.json, tsconfig.json
- **Database Models**: Create Prisma schemas, migrations, ORM models

**Example Automation:**
```bash
# User request: "Add POST /api/users endpoint"
# Claude Code:
# 1. Generates controller with validation
# 2. Creates service with business logic
# 3. Adds database queries
# 4. Writes error handlers
# 5. Commits changes
```

### Test Writing
- **Unit Tests**: Jest/Vitest tests with 80%+ coverage
- **Integration Tests**: Multi-component test scenarios
- **API Tests**: Request/response validation
- **Snapshot Tests**: Component rendering verification

### Documentation Generation
- **API Documentation**: Auto-generate from code comments (JSDoc → OpenAPI)
- **README Updates**: Component docs, setup instructions
- **Changelog**: Summarize commits into release notes
- **Code Comments**: Add explanatory comments to complex logic

### Code Refactoring
- **Pattern Migrations**: Transform code patterns across files (var→const, callback→async-await)
- **Type Additions**: Add TypeScript types to untyped code
- **Dependency Updates**: Upgrade package versions, fix breaking changes
- **Performance**: Remove console.logs, optimize imports, eliminate dead code

### Git Operations
- **Commits**: Stage files and create semantic commit messages
- **Branches**: Create feature/bugfix branches
- **Pull Requests**: Open PRs with auto-generated descriptions
- **Merges**: Merge branches with conflict resolution

---

## 2. archon-os Swarm-Automatable Tasks

These tasks require multi-agent coordination (swarm). Claude Code spawns specialized agents working in parallel.

### Multi-File Refactoring
- Rename variables/functions across 10+ files
- Update API contracts in multiple services
- Consolidate duplicated code across modules

**Swarm Setup:**
```
- Researcher: Analyze codebase, find all occurrences
- Planner: Design refactoring strategy
- Coder: Implement changes in parallel (3-5 agents)
- Tester: Write/update tests
- Reviewer: Check quality and consistency
```

### Cross-Service Integration
- Connect microservices with message queues
- Implement distributed transactions
- Add authentication across multiple APIs

### Complex Feature Implementation
- Multi-step workflows (e.g., checkout flow with payment + inventory)
- Real-time synchronization (WebSocket + database)
- Report generation with data aggregation

### Performance Optimization
- Database query analysis and optimization
- Frontend bundle size reduction
- Memory leak detection and fixes

### Security Audits
- Identify input validation gaps
- Check authentication/authorization flows
- Scan for hardcoded secrets

### End-to-End Testing
- Generate test scenarios from requirements
- Implement full user journey tests
- Create performance benchmarks

---

## 3. Partially-Automatable Tasks (Claude Assists)

Human makes the final decision; Claude provides implementation and analysis.

### Architecture Decisions
- **Claude Does**: Analyze current architecture, propose patterns (microservices vs monolith, caching strategy)
- **Human Does**: Review proposals, approve approach, make trade-off decisions
- **Example**: "What's the best database for our analytics?" → Claude suggests options with pros/cons → You choose

### UI/UX Design
- **Claude Does**: Generate component layouts, CSS, accessibility features, responsive design
- **Human Does**: Review design, request changes, approve final version
- **Example**: "Create a user dashboard" → Claude generates layout → You request tweaks → Claude refines

### Business Logic Implementation
- **Claude Does**: Write algorithms, validation rules, calculation logic
- **Human Does**: Verify logic matches requirements, test edge cases, approve
- **Example**: "Implement discount calculation" → Claude codes → You test → You approve

### Deployment Strategy
- **Claude Does**: Propose deployment architecture, blue-green vs rolling updates, rollback procedures
- **Human Does**: Review strategy, make decisions based on risk tolerance, approve deployment

---

## 4. Manual-Only Tasks (Human Required)

These tasks cannot be automated because they require physical action, external accounts, or legal authority.

### Infrastructure & Hardware
- Network setup and configuration
- Database server provisioning
- GPU/compute resource allocation
- Physical hardware installation
- VPN and firewall configuration

### Domain & DNS Management
- Domain registration
- DNS provider setup
- SSL certificate provisioning
- Email server configuration
- CDN setup

### Third-Party Service Accounts
- Cloudflare account setup and configuration
- Twilio/SendGrid API credentials
- Payment processor integration (Stripe, PayPal)
- Analytics tools (Google Analytics, Mixpanel)
- Cloud provider accounts (AWS, Azure, GCP)

### Legal & Compliance
- Terms of Service review
- Privacy policy approval
- GDPR/CCPA compliance review
- Security audit reports
- Data processing agreements

### Business Decisions
- Budget approvals
- Hiring and team decisions
- Vendor selection
- Service tier choices
- Go/no-go production deployment decisions

### Production Deployment
- Final approval before production release
- Manual rollback if automation fails
- On-call monitoring and incident response
- Customer communication for outages

---

## 5. Automation Workflows

Real-world examples showing how to automate common development tasks.

### Workflow 1: Add New API Endpoint (Fully Automated)

**Request:** "Add GET /api/products?category=X endpoint with filtering and pagination"

**Claude Code Execution:**
1. **Analysis**: Check existing endpoint patterns, database schema
2. **Generation**: Create controller, service, repository layers with validation
3. **Testing**: Write unit and integration tests (80%+ coverage)
4. **Documentation**: Update OpenAPI spec, add JSDoc comments
5. **Commit**: Semantic commit with PR ready
6. **Result**: Complete, tested, documented endpoint ready for review

**Time**: ~5-10 minutes | **Manual Review**: 5 minutes | **Risk**: Low

---

### Workflow 2: Implement User Feature (Swarm Coordinated)

**Request:** "Implement user authentication with JWT, refresh tokens, and password reset"

**Swarm Execution:**
```
Parallel Agent Work:

Researcher (5 min)
└─ Analyze existing auth patterns, security best practices
   └─ Store: JWT strategy, token refresh flow, password reset flow

Architect (7 min)
└─ Design: Multi-layer auth system
   └─ Database: User model, token table
   └─ API: /auth/login, /auth/refresh, /auth/reset endpoints
   └─ Security: Rate limiting, CSRF protection

Coders (10 min parallel)
├─ Coder 1: Authentication logic (JWT, refresh tokens)
├─ Coder 2: Password reset flow (email generation)
├─ Coder 3: Database migrations and models
└─ Merged implementation

Tester (8 min)
└─ Unit tests for each service
└─ Integration tests for full flows
└─ Security tests (brute force protection, token expiry)

Reviewer (5 min)
└─ Code quality, security review
└─ Performance check
└─ Documentation completeness

Result: Complete auth system, fully tested, ready for deployment
```

**Time**: ~20 minutes | **Manual Review**: 10 minutes | **Risk**: Medium (security-critical)

---

### Workflow 3: Security Audit (Mixed Automation)

**Request:** "Security audit of user authentication and payment processing"

**What Automation Does:**
1. Scan for hardcoded secrets (AWS keys, database passwords)
2. Check for common vulnerabilities:
   - SQL injection in queries
   - XSS in templating
   - Missing input validation
   - Weak password requirements
3. Analyze authentication flow for gaps
4. Generate security report

**What Humans Review:**
1. Security findings and severity assessment
2. Risk of vulnerabilities in your specific context
3. Prioritization of fixes
4. Final approval of security measures

**Time**: Scan + report ~10 min | Manual review + decisions ~30 min

---

### Workflow 4: Deploy to Production (Human-Gated)

**Automation Handles:**
1. Run full test suite (automated abort if failures)
2. Build Docker images
3. Run security scans
4. Deploy to staging environment
5. Run smoke tests on staging
6. Generate deployment report with rollback instructions

**Human Decides:**
1. Review deployment report and risk assessment
2. Approve or reject deployment
3. Monitor first 5 minutes after deployment
4. Decide on rollback if issues detected

**Automated Rollback:**
- If critical errors detected in first 5 min → automatic rollback with notification
- Incident report generated
- Manual investigation required

---

## 6. When to Use Which Automation Level

### Use Claude Code When:
- ✅ Single file or related files in one service
- ✅ Straightforward requirements (no ambiguity)
- ✅ Clear test criteria
- ✅ Non-critical changes (can iterate)

### Use Swarm When:
- ✅ Changes across 3+ services
- ✅ New features requiring multiple expertise areas
- ✅ Performance/security optimization needed
- ✅ Tight timeline (parallel execution saves time)

### Require Human Review When:
- ✅ Security or authentication changes
- ✅ Database schema changes affecting data
- ✅ Public API contract changes
- ✅ Infrastructure changes

### Require Manual Execution When:
- ✅ Involves physical systems or external accounts
- ✅ Legal/compliance implications
- ✅ Budget or hiring decisions
- ✅ Production deployment approvals

---

## 7. Quick Reference Table

| Task Type | Automation | Time Saved | Risk | Review Time |
|-----------|-----------|-----------|------|------------|
| API endpoint | 100% Claude | 90% | Low | 5 min |
| Unit tests | 100% Claude | 85% | Low | 5 min |
| Refactoring | 100% Claude | 80% | Low | 10 min |
| Feature (complex) | Swarm | 70% | Medium | 20 min |
| Documentation | 100% Claude | 95% | Low | 5 min |
| Security audit | Mixed | 60% | High | 30 min |
| Deployment | Gated | 85% | High | 10 min |
| Infrastructure | Manual | 0% | High | - |

---

## Example: How to Request Claude Automation

### ❌ Vague Request (Low Quality Automation)
"Add authentication"

### ✅ Clear Request (Effective Automation)
"Add JWT authentication with:
- POST /auth/login (email/password) → returns access + refresh tokens
- POST /auth/refresh → refreshes access token using refresh token
- Password reset via email link
- Token expiry: 15 min (access), 7 days (refresh)
- Rate limit: 5 attempts per hour
- Tests: 80%+ coverage"

### Result Differences:
- Vague: Claude guesses, creates incomplete implementation, needs rewrites
- Clear: Claude executes exact specification, fully tested, merge-ready

---

## Summary

**Claude automates well**: Code generation, testing, documentation, refactoring, simple features.

**Claude + Team automates well**: Complex features, multi-service changes, optimization, security work.

**Teams decide**: Architecture, business logic trade-offs, production deployment.

**Humans execute**: Infrastructure, external accounts, legal review, hiring, incident response.

**Result**: 70-80% faster development while maintaining human oversight on critical decisions.
