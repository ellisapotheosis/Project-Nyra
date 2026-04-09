# CLAUDE.md Template - Basic Service

This template provides a foundation for configuring a simple microservice with Claude Flow V3.

## Template Metadata
- Type: Service
- Complexity: Basic
- Team Size: Solo Developer or Small Team (2-5)
- Architecture: Microservice
- Use Case: RESTful API, background worker, data processor

## Template Content

```markdown
# Claude Code Configuration - [Service Name]

## Core Service Information

- Service Name: [name]
- Purpose: [brief description]
- Technology Stack: [languages/frameworks]
- Team Size: [1-5 people]
- Deployed Environment: [dev/staging/prod]

## Development Patterns

### Code Style & Quality
- Language: [TypeScript/Python/etc]
- Linting: [ESLint/Ruff/etc]
- Code Format: Prettier/Black
- Type Safety: Strict mode enabled
- Test Framework: Jest/Pytest

### Testing Strategy
- Unit Test Coverage: 70%+
- Integration Tests: Required for APIs
- E2E Tests: Critical paths only
- Test Command: `npm test` or `pytest`

### Error Handling
- Use custom error types
- Log errors with context
- Validate all inputs
- Handle edge cases gracefully

## MCP Integration

### Required MCP Tools
- List MCPs this service depends on
- Configuration for each MCP
- Authentication requirements

### Service Registration
- Service discovery method
- Health check endpoint
- Graceful shutdown handling

## Deployment

### Container Configuration
- Base image: [Alpine/Debian]
- Exposed ports: [list ports]
- Environment variables: [critical vars]
- Resource limits: CPU/Memory

### CI/CD Pipeline
- Build trigger: On PR/commit
- Test execution: Automated
- Security scanning: SAST enabled
- Deploy to: Dev → Staging → Prod

## Monitoring & Observability

### Logging
- Format: JSON structured logs
- Level: INFO in prod, DEBUG in dev
- Destinations: [CloudWatch/ELK/etc]

### Metrics
- Request latency tracking
- Error rate monitoring
- Throughput metrics
- Custom business metrics

### Alerting
- Alert on: High error rate, latency spikes
- Notification channels: Slack/PagerDuty
- Alert thresholds: [define limits]

## Security

### Authentication & Authorization
- JWT token validation
- API key management
- Role-based access control
- Input validation on all endpoints

### Data Protection
- Encryption at rest: [method]
- Encryption in transit: TLS 1.3+
- Sensitive data masking in logs
- GDPR compliance where applicable

## Dependencies

### Internal Services
- List internal service dependencies
- Version requirements
- Communication protocol

### External Services
- Third-party API integrations
- SDKs and libraries
- License compliance

## Claude Flow Integration

### Swarm Coordination (if applicable)
- Topology: [hierarchical/mesh]
- Max agents: [number]
- Coordination strategy: [specialized/balanced]

### Memory Management
- AgentDB backend: [enabled/disabled]
- Vector search: [HNSW indexing]
- Session persistence: [enabled/disabled]

### Auto-Learning
- Hook triggers: post-task, post-edit
- Neural pattern training: [enabled/disabled]
- Performance optimization: [enabled/disabled]

## Development Workflow

### Local Setup
```bash
npm install
npm run dev          # Start development server
npm test            # Run tests
npm run lint        # Check code style
```

### Before Committing
1. Run tests: `npm test`
2. Check linting: `npm run lint`
3. Update documentation
4. Verify security: No secrets in code

### Making Changes
- Create feature branch from main
- Write tests first (TDD preferred)
- Keep commits atomic and descriptive
- Request code review before merging

## Common Tasks

### Adding a New Endpoint
1. Define route handler
2. Add input validation
3. Write tests for happy path and errors
4. Update API documentation
5. Add monitoring/logging

### Integrating a New MCP
1. Configure MCP connection
2. Add error handling
3. Test integration thoroughly
4. Document configuration
5. Update secrets management

### Performance Optimization
1. Profile application: `npm run profile`
2. Identify bottlenecks
3. Implement optimizations
4. Benchmark before/after
5. Deploy gradually

## Troubleshooting

### Common Issues
- [Issue 1]: [Diagnosis & Solution]
- [Issue 2]: [Diagnosis & Solution]
- Service not responding: Check health endpoint, review logs
- Database connection errors: Verify credentials, connection string

### Debug Mode
```bash
DEBUG=service:* npm run dev   # Enable debug logging
NODE_ENV=development npm test # Development testing
```

## Resources

- API Documentation: [link]
- Architecture Guide: [link]
- Deployment Guide: [link]
- Team Wiki: [link]

## Support & Escalation

- Slack channel: [#service-name]
- On-call: [contact info]
- Code review reviewer: [name]
- Escalation path: [tech lead → engineering manager]

---
**Template Version**: 1.0
**Last Updated**: 2026-01-22
**Maintained By**: [Your Team]
```

## Customization Guidelines

### For Different Service Types

**API Service**: Add specific endpoint documentation, authentication scheme, rate limiting

**Background Worker**: Add job queue configuration, retry strategy, dead letter handling

**Data Processor**: Add pipeline configuration, data validation rules, error recovery

**Integration Service**: Add external API credentials, webhook configuration, data mapping

## Usage

1. Copy this template to your service directory as `CLAUDE.md`
2. Replace all `[bracketed placeholders]` with your service details
3. Add service-specific sections as needed
4. Keep the file updated as your service evolves
5. Use with `npx @claude-flow/cli@latest validate CLAUDE.md` to verify

