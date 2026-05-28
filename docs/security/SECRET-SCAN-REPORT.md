# Project Nyra Secret Scanning Report

**Date**: 2026-05-19
**Scope**: Project Root (excluding node_modules and .git)

## Summary

A comprehensive scan for API keys, tokens, and secrets was performed. No real production secrets were found committed in plain text. Most findings were related to environment variable mappings, redaction logic, or documentation examples.

## Findings

### 1. Environment Variable Mappings

- **Twilio**: Mapped in `services/twilio-integration/src/config/twilio.config.ts`. Correctly uses `process.env`.
- **SendGrid**: Mapped in `services/campaign-engine/app/main.py`. Correctly uses `os.getenv`.
- **Supabase**: Mapped in multiple locations (`apps/projectnyra/src/lib/supabase.ts`, etc.). Correctly uses `process.env`.

### 2. Redaction Logic

- Redaction patterns for PII and secrets were identified in:
  - `packages/websocket-client/src/WebSocketClient.ts`
  - `services/quote-engine/app/privacy.py`
  - `services/campaign-engine/app/privacy.py`

### 3. Database Schema

- `packages/database/prisma/schema.prisma` correctly uses `passwordHash` rather than plaintext passwords.

### 4. Githooks

- `.githooks/pre-commit` includes a warning to remove secrets before committing.

## Recommendations

- **Infisical Integration**: Continue migrating all `.env` variables to Infisical Machine Identities.
- **CI/CD Scan**: Implement `gitleaks` or similar in the CI pipeline to prevent accidental commits.
- **Audit Logging**: Ensure that `audit_events` do not contain raw request bodies if they include sensitive fields (already covered by redaction logic in services).
