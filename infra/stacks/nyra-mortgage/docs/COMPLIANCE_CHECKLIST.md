# Compliance & Legal (engineering checklist)

This is NOT legal advice. It's a build checklist to support your attorney/compliance officer.

## Messaging / calling
- Track *express written consent* for SMS/auto-dialed calls.
- Provide opt-out keywords (STOP/UNSUBSCRIBE) and honor them immediately.
- Maintain DNC lists; suppress contacts on request.
- Avoid ringless voicemail unless counsel explicitly approves.

## Privacy / data security
- Treat borrower data as sensitive (GLBA).
- Encrypt in transit (TLS) and at rest (disk + DB).
- Least privilege access + role-based permissions.
- Retention + deletion policies.

## Mortgage-specific
- Any “quote” / “rate” / “payment” statement may trigger advertising and disclosure obligations.
- If you generate pre-qualification info, ensure ECOA/FCRA obligations are respected.
- Keep a human-in-the-loop for anything that could be construed as advice or a credit decision.

## Auditing
- Store copies of:
  - messages (SMS/email/voice transcripts)
  - disclaimers shown
  - versioned policies (prompt + rules)
  - who approved/triggered outbound messages

