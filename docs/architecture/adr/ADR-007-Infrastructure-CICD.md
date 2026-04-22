# ADR-007: Infrastructure & CI/CD

* **Status**: Accepted
* **Date**: 2026-04-22
* **Author**: Nyra Dev
* **Decisions**: GitHub Actions for CI/CD, Docker for containerization, and staging/production environments.

## Context

The system needs a reliable deployment pipeline that enforces quality and security gates.

## Decision

1. **CI Pipeline**: 
    - Linting and Type-checking.
    - Unit and Integration tests.
    - Security scanning (Snyk/npm audit).
    - Database migration dry-runs.
2. **CD Pipeline**:
    - Automated deployment to Staging on `develop` branch.
    - Manual approval for Production deployment on `main` branch.
3. **Infrastructure**:
    - Dockerized services for consistency across environments.
    - Integration with the Nyra Orchestrator (LiteLLM, Langfuse, etc.).

## Consequences

* **Positive**:
    - Fast, reliable deployments.
    - Consistent environments.
    - Security is baked into the pipeline.
* **Negative**:
    - Overhead of maintaining CI/CD configurations.

## Compliance & Security

- CD pipeline includes "Compliant Deployment" checks (e.g., ensuring secrets are not in the image).
