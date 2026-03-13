# 🏢 Enterprise Foundation Module

## Organization Context
**Organization**: {{orgName}}
**Application**: {{appName}}
**Environment**: {{environment}}
**Port**: {{port}}
**Version**: {{version}}

## Enterprise Standards

### Git Protocol
- **Branching Strategy**: GitFlow with `main`, `develop`, `feature/*`, `hotfix/*`
- **Commit Policy**: No direct commits to `main` or `develop`
- **PR Requirements**: Minimum 2 reviewers, all checks must pass
- **Commit Format**: `type(scope): description` (Conventional Commits)

### Code Review Standards
- All PRs require code review before merge
- Security review for authentication/authorization changes
- Performance review for database queries
- Accessibility review for UI changes

### Documentation Requirements
- README.md in every major directory
- API documentation (OpenAPI/Swagger)
- Architecture Decision Records (ADRs) for significant changes
- Inline comments for complex logic only

### Memory Management
- **Memory Bank**: Maintain `memory-bank.md` for session context
- **Update After**: Every significant change, completed feature, or decision
- **Include**: Current tasks, recent changes, important decisions, known issues

### Quality Gates
- All code must pass linting (`npm run lint` / `mvn checkstyle:check`)
- All code must pass type checking
- All tests must pass before PR creation
- Code coverage must meet minimum threshold (80%)

---
