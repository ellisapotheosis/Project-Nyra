# ADR-006: Testing Strategy (TDD London School)

* **Status**: Accepted
* **Date**: 2026-04-22
* **Author**: Nyra Dev
* **Decisions**: Adoption of "Outside-In" TDD (London School) and Enterprise-grade testing patterns.

## Context

We need high confidence in the domain logic, especially compliance and financial calculations. The system must be "secure by design" and "correct by design".

## Decision

1. **London School TDD**: Start with an Acceptance Test (Outside) for each use case, then drive out the Domain Entities and Infrastructure Adapters (Inside) using Unit Tests.
2. **Mocking**: Use heavy mocking for external dependencies during unit tests to isolate the unit of work.
3. **Coverage**: Target >90% coverage for the Domain and Application layers.
4. **Levels of Testing**:
    - **Unit Tests**: Domain entities and services.
    - **Integration Tests**: Adapters (Prisma, API clients).
    - **Acceptance Tests**: Use cases with mocked infrastructure.
    - **E2E Tests**: Critical paths in the final UI.

## Consequences

* **Positive**:
    - High design quality and decoupled code.
    - Immediate feedback on breaking changes.
    - Compliance rules are verified by multiple test layers.
* **Negative**:
    - Slower initial development speed.
    - Fragile tests if mocks are not maintained correctly.

## Compliance & Security

- Every compliance rule (e.g., TRID timelines) must have a corresponding test suite that fails if the rule is violated.
