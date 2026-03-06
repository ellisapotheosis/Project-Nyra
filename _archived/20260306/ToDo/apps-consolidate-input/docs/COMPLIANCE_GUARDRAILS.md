# Compliance & Guardrails (Borrower-facing Agents)

> I’m not a lawyer. This is an engineering/compliance checklist to take to counsel/compliance. Build with the assumption that regulators will audit your logs.

## 1) Core “hard rules”
Borrower-facing agents must be **logistical only**:
- request documents needed for processing/underwriting
- status updates through pipeline stages
- scheduling / rescheduling
- collecting missing contact info
- confirming preferred channels
- handing off to licensed human when loan terms/strategy/pricing are requested

Explicitly block:
- rate quotes, lender comparisons, lock advice, “what should I do”
- underwriting promises (“you’ll be approved”)
- steering (fair lending risk)
- collecting sensitive data in chat if you don’t have the right controls (SSN, DOB, full bank acct #)

## 2) Consent and messaging (TCPA / CAN-SPAM / state rules)
Implement a **Consent Ledger**:
- consent scope: SMS / voice / email
- source of consent (webform, recorded call, vendor lead, text-to-join)
- timestamp, IP, user agent
- DNC flags + “STOP” handling
- opt-out propagates everywhere in < 1 minute

Minimum content requirements:
- identify sender/business
- opt-out instruction (STOP for SMS)
- email footer + unsubscribe
- do not spoof caller ID
- honor quiet-hours policy per state/timezone

## 3) Privacy & data security (GLBA + safeguards)
Mortgage leads are financial data.
- encrypt at rest (DB + backups)
- encrypt in transit (TLS)
- role-based access + audit logs
- least-privilege for vendors/tools
- document retention schedule

## 4) Operational controls that reduce legal risk
- **Human approval gates** for any message that references:
  - loan terms
  - underwriting conditions
  - documents that reveal sensitive info
- **Message classification**:
  - Allowed: status, scheduling, doc request
  - Needs approval: anything else
- **Template whitelisting**:
  - borrower-facing messages must come from vetted templates
  - LLM can only fill variables, not invent content
- **Vendor lead source normalization**
  - store vendor-provided consent text verbatim
  - do not assume consent from a vendor unless contract + proof

## 5) Auditability requirements
Store immutable logs:
- every inbound/outbound message
- model/tool decisions (why a template was chosen, which guardrail allowed it)
- operator overrides
- escalation events

## 6) “Safe” borrower chat UX
- show “AI assistant for scheduling and document collection” disclaimer
- one-tap “talk to human”
- do not ask for SSN/DOB in chat
- offer secure upload portal instead

## 7) Implementation hooks in this repo
- `services/nyra-orchestrator/` includes policy-mode env vars.
- add approvals + consent checks before passing tasks to n8n/Dify actions.
