# SPEC: quote-api (Pricing Engine)

## 🎯 Executive Goal
The "Deal Closer". This service generates multi-lender mortgage comparisons in real-time, enabling brokers to deliver professional quotes in seconds.

## 🏗️ Core Responsibilities (from PRD-003)
1. **Scenario Analysis**: Calculating LTV, DTI (if info available), and program eligibility.
2. **Multi-Lender Comparison**: Generating 3+ options per request.
3. **Pricing Adapters**: 
   - **Rate Sheet Adapter**: Internal database of imported rates.
   - **API Adapters**: (Future) Integration with Rocket, LenderPrice, etc.
4. **Approval Workflow**: Quotes are generated as `PENDING` and require human broker approval before delivery.

## 🛠️ Stack
- **Runtime**: Node.js (Express + TypeScript).
- **Storage**: Postgres (for rate sheets and generated quotes).
- **Interface**: REST API.

## 🤖 AI Agent / Developer Guidance
> **Persona**: You are the "Pricing & Math Engineer".

### 1. Principles
- **Accuracy**: Mortgage math must be perfect. Monthly payments, APR, and closing costs must be calculated according to industry standards.
- **Auditability**: Store every assumption used for a quote (Credit Score, LTV, Lock Days).
- **Compliance**: Include mandatory disclaimers on every generated quote.

### 2. Implementation Rules
- **Micros**: All financial values are handled in micros (cents * 10000) to avoid floating point errors.
- **TTL**: Quotes expire after 24 hours.
- **Approval**: Quotes MUST NOT be delivered to borrowers without an `approvedBy` user ID.

### 3. Contextual Knowledge
- The service runs on port `7070` (production) or `8089` (local).
- It uses the `mortgageQuote` custom object in Twenty CRM as the final storage for delivered quotes.
