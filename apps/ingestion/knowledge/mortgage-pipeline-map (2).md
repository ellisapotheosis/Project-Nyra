# Mortgage Pipeline Map (agent touchpoints)

1. **Lead Intake & CRM** → auto-log, dedupe, tag.
2. **Pre-Qual & Pricing** → DTI/LTV calc, investor/pricing engines, scenarios.
3. **Doc Collection** → OCR/extraction + compliance tagging.
4. **LOS Entry & Disclosures** → push to LOS, generate disclosures.
5. **Underwriting & Conditions** → status graph updates, task queue.
6. **Appraisal & Locks** → vendor calls, lock strategy.
7. **Clear-to-Close** → closing package, final CD.
8. **Post-Close & Marketing** → tasks, review requests, drip sequences.

Each step emits: **events** (time-stamped), **entities** (borrower, loan, doc),
**edges** (submitted, approved, blocked_by), syncing to Graphiti (Neo4j/Falkor) and Letta/Chroma.
