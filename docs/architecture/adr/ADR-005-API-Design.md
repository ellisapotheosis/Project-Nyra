# ADR-005: API Design

* **Status**: Accepted
* **Date**: 2026-04-22
* **Author**: Nyra Dev
* **Decisions**: Primary REST API, secondary GraphQL for complex dashboard queries.

## Context

The system needs to support multiple frontends (Admin Dashboard, Borrower Portal) and external integrations.

## Decision

1. **REST**: Primary interface for command-based operations (create lead, submit application) and simple CRUD.
2. **GraphQL**: Utilized for the Loan Officer Dashboard where complex, nested data fetching is required to reduce over-fetching.
3. **Documentation**: OpenAPI (Swagger) for REST; Schema-first for GraphQL.

## Consequences

* **Positive**:
    - Familiarity for integration partners (REST).
    - Performance efficiency for UI (GraphQL).
* **Negative**:
    - Overhead of maintaining two API styles.

## Compliance & Security

- API versioning is critical for maintaining compliance as regulations change.
- Strict input validation using Zod for both REST and GraphQL.
