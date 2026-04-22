# ADR-004: Database Choice

* **Status**: Accepted
* **Date**: 2026-04-22
* **Author**: Nyra Dev
* **Decisions**: PostgreSQL with Prisma ORM.

## Context

We need a relational database to handle complex loan application structures, audit trails, and relationships between borrowers, leads, and documents.

## Decision

1. **Database**: PostgreSQL for ACID compliance and robust relational features.
2. **ORM**: Prisma for type-safe database access and migrations.
3. **Integration**: While Twenty CRM is the system of record for contact management, the Mortgage CRM will maintain specialized loan data in this DB, synchronized with Twenty where necessary.

## Consequences

* **Positive**:
    - Type safety across the stack.
    - Easy migration management.
    - Strong consistency for financial data.
* **Negative**:
    - Need to manage sync between Mortgage DB and Twenty CRM.

## Compliance & Security

- PostgreSQL supports encryption at rest and in transit.
- Prisma middleware can be used for automatic field-level encryption and audit logging.
