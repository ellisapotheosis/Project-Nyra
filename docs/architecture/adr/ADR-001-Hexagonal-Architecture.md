# ADR-001: Hexagonal Architecture Pattern

* **Status**: Accepted
* **Date**: 2026-04-22
* **Author**: Nyra Dev
* **Decisions**: Implementation of Hexagonal (Ports and Adapters) Architecture.

## Context

The Mortgage CRM requires a stable core domain logic that is decoupled from external infrastructure (databases, APIs, third-party services like AUS or Credit Bureaus). Compliance rules are first-class citizens and must be testable in isolation.

## Decision

We will use Hexagonal Architecture. 
- **Domain Layer**: Contains entities, value objects, and domain services. Zero dependencies on outer layers.
- **Application Layer**: Contains use cases that orchestrate domain logic. Defines "Ports" (interfaces).
- **Infrastructure Layer**: Implements "Adapters" for the Ports (e.g., Prisma repository, REST controllers, external service clients).

## Consequences

* **Positive**:
    - High testability (can test domain without DB).
    - Flexibility to swap infrastructure (e.g., change from PostgreSQL to another DB).
    - Explicit boundaries for compliance logic.
* **Negative**:
    - Increased boilerplate (interfaces, DTO mappings).
    - Slightly higher initial complexity.

## Compliance & Security

- Isolation of compliance logic ensures that changes to UI or DB cannot accidentally bypass mandatory disclosure rules or timing requirements.
