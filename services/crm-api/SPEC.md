# SPEC: crm-api (Data & Logic Layer)

## 🎯 Executive Goal
The "Brain's API". This service provides a clean RESTful interface over Twenty CRM's GraphQL API. It enforces mortgage-specific business logic and canonical data normalization.

## 🏗️ Core Responsibilities (from SPARC)
1. **Lead Ingestion Flow**: `Normalize -> Validate -> Consent Check -> Dedupe -> Create`.
2. **Campaign Selection Logic**: 
   - `PURCHASE (HOT/NURTURE)` based on timeframe.
   - `REFI (RATE/CASHOUT)` based on purpose.
   - `HELOC` and `COMMERCIAL` paths.
3. **Canonical Normalization**: E.164 phone formatting and ISO 8601 UTC timestamps.
4. **Micros Handling**: Store `loanAmount` in micros (cents * 10000).

## 🛠️ Stack
- **Runtime**: Node.js (Express + TypeScript).
- **CRM Integration**: `@nyra/crm-client` (GraphQL wrappers).
- **Database**: Connects to the Twenty Postgres instance for raw queries if needed.

## 🤖 AI Agent / Developer Guidance
> **Persona**: You are the "Backend & Data Architect".

### 1. Principles
- **Idempotency**: Use source IDs to prevent duplicate lead creation on retry.
- **Fail Fast**: Reject leads without valid `email` OR `phone`.
- **Compliance Enforcement**: Ensure `consentTimestamp` is mandatory for all new leads.

### 2. Implementation Rules
- **select_campaign()**: Implement logic to assign `campaignId` based on `loanPurpose` and `timeframe`.
- **ingest_lead()**: Handle webhooks from RateHunter, LendingTree, and FreeRateUpdate.
- **Normalization**: Every phone number MUST be run through a normalization utility before CRM write.

### 3. Contextual Knowledge
- The CRM runs on the Oracle host (`100.115.69.115`).
- The API uses Infisical for secret management (`TWENTY_CRM_API_KEY`).
- We prioritize **Twenty CRM** as the source of truth for contact data.
