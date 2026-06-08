# ADR-002: Security and Authentication

- **Status**: Accepted
- **Date**: 2026-04-22
- **Author**: Nyra Dev
- **Decisions**: Use Project Nyra-owned auth boundaries with Supabase-compatible local/self-hosted auth helpers where needed, RBAC for permissions, and AES-256-GCM for PII encryption.

## Context

Handling Mortgage applications involves highly sensitive PII (SSNs, Financials). Security is paramount for SOC 2 and regulatory compliance.

## Decision

1. **Authentication**: Keep the internal app auth target under Nyra-controlled service boundaries. Supabase-compatible local/self-hosted auth is the default current implementation path; Clerk is not the target auth provider unless explicitly reauthorized.
2. **Authorization**: Implement Role-Based Access Control (RBAC) within the application layer.
3. **Data Protection**:
   - Field-level encryption for sensitive fields (SSN, DOB) using `aes-256-gcm`.
   - Encryption at rest (standard RDS/Cloud).
   - TLS 1.3 for all traffic.

## Consequences

- **Positive**:
  - Reduced risk of credential theft.
  - Simplified multi-tenant security.
  - Compliance with data privacy laws (GLBA, CCPA).
- **Negative**:
  - Nyra owns more operational responsibility for auth configuration and key rotation.
  - Performance overhead of field-level encryption/decryption.

## Compliance & Security

- Addresses GLBA Safeguards Rule.
- Provides audit trails for data access.
