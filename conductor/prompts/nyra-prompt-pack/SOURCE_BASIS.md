# Source Basis and Assumptions

This prompt pack was generated from:

- Ellis's current Master Build Brief in the conversation.
- Uploaded current-state architecture notes.
- Uploaded Project Nyra deep research review.
- Uploaded finish-line master documents.
- Uploaded workflow/platform blueprint materials.
- Previously generated Codex config consolidation context.

The live repo path `/home/ellisapotheosis/repos/project-nyra` was not mounted inside this sandbox, so this pack does not claim to have re-inspected the live filesystem. Every agent prompt therefore requires a repo preflight: `git status`, package-manager detection, active source inspection, and relevant doc review.

## Conflict resolution used

Where uploaded materials conflicted, this prompt pack follows the latest explicit user brief and the most current consolidation direction:

- Landing and internal app remain separate.
- Webapp absorbs admin and mortgage CRM prototypes.
- `apps/twenty` stays untouched.
- TwentyCRM remains system of record.
- Supabase is app backend/auth/storage.
- n8n is internal-only execution.
- OpenClaw is assistant surface via service boundary.
- Activepieces, Letta, OpenMemory, Graphiti, RuVector, Flow-Nexus, Archon, and similar older/deprecated components are not target production core unless Ellis explicitly reauthorizes them.

## Safety assumption

For borrower communications, this pack defaults to conservative behavior:

- external email/SMS drafting and queueing before autonomous send;
- Never create or imply fake missed-call pings, fake voicemails, fake borrower actions, fake consent, fake quote records, or fake audit events. Only record events that actually happened.
- voice/SMS/email all gated by consent/compliance checks;
- quote output broker-approved before borrower-facing delivery;
- no scraping gated lender systems without official authorization.
