# DOMAIN_MODEL.md

## Canonical Entities

The following entities are defined in `@nyra/domain-models` and serve as the standard contract for all services.

### 1. Lead

- **Definition**: A potential borrower or inquiry.
- **Key Fields**: `firstName`, `lastName`, `email`, `phone`, `source`, `stage`, `consentStatus`, `doNotContact`.

### 2. Mortgage Scenario

- **Definition**: A specific loan structure.
- **Key Fields**: `loanAmount`, `interestRate`, `loanTermYears`, `monthlyPayment`, `closingCosts`, `apr`.

### 3. Quote

- **Definition**: A 3-option comparison provided to a lead.
- **Options**: `lowestPayment`, `balanced`, `lowestCost`.

### 4. Audit Event

- **Definition**: A record of any significant system action or mutation.
- **Key Fields**: `entityType`, `action`, `riskLevel`, `performer`, `timestamp`.

### 5. Memory Record

- **Definition**: A piece of contextual information for AI agents.
- **Key Fields**: `content`, `confidence`, `sourceEventId`, `tags`.

## Status Enums

### LeadStage

- `NEW`: Fresh ingestion.
- `CONTACTED`: First outreach performed.
- `NURTURING`: Enrolled in campaign.
- `DO_NOT_CONTACT`: Opted out (Terminal).
- `LOST`: No longer viable.
- `FUNDED`: Successful loan completion.

### ConsentStatus

- `UNKNOWN`: Default.
- `OPTED_IN`: Explicit consent given.
- `OPTED_OUT`: Explicit opt-out received (Must honor).

### AgentActionRisk

- `READ_ONLY`: Safe for any agent.
- `CRM_MUTATION`: Requires auditing.
- `BORROWER_COMMUNICATION`: Highest risk; often requires human approval.
