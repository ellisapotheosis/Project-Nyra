# Legal & Compliance Notes (US-focused)

Not legal advice. Use this as a build checklist to review with your compliance attorney.

## Messaging (calls/SMS): TCPA

- Automated calls/texts to cell phones can trigger TCPA requirements (consent + opt-out handling).
- Store consent proof: source, timestamp, language used, lead provider, and opt-out logs.

Refs:

- FCC / FTC summaries of TCPA rules and consent guidance (check current guidance).
- Recent case-law shifts exist; treat TCPA as high-stakes and get counsel.

## Email: CAN-SPAM

- Accurate headers, non-deceptive subject, disclosure where needed, physical address, and a working opt-out that is honored.

Ref:

- FTC CAN-SPAM compliance guide.

## Privacy/Security: GLBA Safeguards

Mortgage operations touch customer information. Align your security controls (access control, encryption, vendor risk, monitoring, incident response).

Ref:

- FTC GLBA Safeguards Rule overview.

## Fair lending / UDAAP (CFPB)

Even “logistics-only” automation can create risk via prioritization, messaging content, and escalation patterns.

- Standardize messaging + ensure human escalation for pricing/underwriting.
- Keep audit logs of tool calls and policy versions.

Ref:

- CFPB guidance and bulletins on AI and automated decisioning (check latest).

## Practical Nyra controls

- Borrower agents cannot access filesystem/github/docker MCP tools (Nexus policy).
- Borrower agent cannot quote rates without Quote API object.
- Central unsubscribe + STOP/HELP flows.
- Redaction in logs (no SSNs, DOBs, full account numbers).
