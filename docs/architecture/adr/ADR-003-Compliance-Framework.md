# ADR-003: Compliance Framework

* **Status**: Accepted
* **Date**: 2026-04-22
* **Author**: Nyra Dev
* **Decisions**: Implement automated compliance checks for RESPA, TILA, and HMDA.

## Context

Mortgage lending is heavily regulated. Violations carry significant legal and financial penalties.

## Decision

1. **Rule Engine**: Compliance rules (e.g., "Loan Estimate must be sent within 3 days") will be implemented as Domain Services.
2. **Audit Logging**: Every action affecting a loan's status or disclosures must be logged immutably.
3. **Automated Monitoring**: System will flag upcoming deadlines (disclosure timing) to prevent violations.

## Consequences

* **Positive**:
    - Reduces human error in compliance.
    - "Audit-ready" state at all times.
    - Competitive advantage through speed and accuracy.
* **Negative**:
    - Complex domain logic.
    - Ongoing maintenance as regulations change.

## Compliance & Security

- Direct implementation of RESPA (Section 8), TILA-RESPA Integrated Disclosure (TRID), and HMDA reporting requirements.
