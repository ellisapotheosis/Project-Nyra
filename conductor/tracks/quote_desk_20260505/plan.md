# Implementation Plan: Quote Desk MVP

## Phase 1: Scenario Input

- [ ] Task: Create quote request form with fields for Property Value, Loan Amount, Credit, etc.
- [ ] Task: Implement validation for loan parameters (LTV, DTI)
- [ ] Task: Wire form to `quoteApi.compareLoanTypes`

## Phase 2: Comparison and Review

- [ ] Task: Build 3-column comparison grid for mortgage scenarios
- [ ] Task: Implement detailed view for each scenario (assumptions ledger)
- [ ] Task: Add "Pending Review" status to generated quotes

## Phase 3: Approval and Sync

- [ ] Task: Implement "Approve Quote" button and logic
- [ ] Task: Wire approval to `crmApi.approveQuote`
- [ ] Task: Ensure CRM timeline is updated upon quote approval
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Approval and Sync' (Protocol in workflow.md)
