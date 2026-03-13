# 🔍 Verification Strict Module

## Quality Verification Protocol

### Pre-Commit Verification
**CRITICAL**: Before generating any commit message or creating PR:
1. Run full linting: `{{lintCommand}}`
2. Run all tests: `{{testCommand}}`
3. Run type checking: `npm run typecheck` / `mvn verify`
4. Check code coverage meets minimum threshold
5. Verify no console.log / debug statements in production code
6. Ensure no TODO/FIXME comments in committed code

### Code Accuracy Standards
- **No Hallucinations**: NEVER assume external libraries exist - verify in package.json first
- **Import Verification**: Double-check all import statements are correct
- **API Verification**: Verify API endpoints and method signatures before use
- **Type Safety**: All functions must have explicit return types (TypeScript)
- **Null Safety**: Handle null/undefined cases explicitly

### Testing Requirements
- **Every Feature Needs Tests**: No feature is complete without tests
- **Test Coverage**: Minimum 80% code coverage for new code
- **Test Types Required**:
  - Unit tests for business logic
  - Integration tests for API endpoints
  - E2E tests for critical user flows
- **Test Naming**: Descriptive test names following pattern: `should_<expected_behavior>_when_<condition>`

### Code Review Checklist
Before submitting code, verify:
- [ ] Code follows project conventions
- [ ] No hardcoded values (use config/env)
- [ ] Error handling implemented
- [ ] Logging appropriate level (not too verbose)
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Documentation updated (if needed)
- [ ] Migration scripts created (if DB changes)

### Accuracy Verification Process
When implementing features:
1. **Read First**: Read existing code before modifying
2. **Verify Patterns**: Follow existing patterns in codebase
3. **Check Dependencies**: Verify library versions and APIs
4. **Test Locally**: Test changes locally before committing
5. **Review Diff**: Review git diff for unintended changes

### Breaking Changes Protocol
If introducing breaking changes:
1. Document in CHANGELOG.md
2. Add deprecation warnings in previous version
3. Provide migration guide
4. Update all affected documentation
5. Notify team via appropriate channel

### Performance Verification
- Profile code for performance issues
- Check database query efficiency (N+1 queries)
- Verify no memory leaks
- Test with production-like data volumes
- Measure and document performance metrics

### Documentation Accuracy
- Code comments must be accurate and up-to-date
- API documentation must match implementation
- README instructions must be tested and work
- Architecture diagrams must reflect current state

### Rollback Readiness
- Every deployment must have rollback plan
- Database migrations must be reversible
- Feature flags for gradual rollout
- Monitoring alerts configured before deployment

---
