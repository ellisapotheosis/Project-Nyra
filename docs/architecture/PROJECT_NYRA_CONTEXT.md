# PROJECT_NYRA_CONTEXT.md

## Project Vision

Project Nyra is a broker-facing AI mortgage operations platform and future SaaS for mortgage brokers. It is designed to be the "brain" for a mortgage broker's office, automating the high-volume, repetitive tasks of lead management, follow-up, and scenario comparison.

## Target Audience

- **Primary**: Mortgage Brokers (Professional Users)
- **Secondary**: Realtors (Partners)
- **Tertiary**: Borrowers (Subject of automation, but not the primary interface user)

## Key Value Propositions

1. **Automation of Lead Drip Campaigns**: Ensuring no lead is dropped through compliant, multi-channel outreach.
2. **Intelligent Lead Classification**: Using AI to detect intent, STOP requests, and positive interest.
3. **Deterministic Quote Generation**: Providing brokers with a 3-option comparison tool (Lowest Payment, Balanced, Lowest Cost).
4. **Unified System of Record**: Centralizing all data in TwentyCRM, ensuring a single source of truth for leads and communication.
5. **AI Fleet Control**: Coordinating multiple local and cloud-based AI models through Nexus Router and OpenClaw.

## Absolute Constraints

- **Compliance**: TCPA/CCPA compliance is mandatory. STOP/DNC intent must immediately halt automation.
- **Data Integrity**: TwentyCRM is the ONLY system of record. n8n/Activepieces are for execution, not storage.
- **Safety**: Assistant MUST NOT hallucinate mortgage rates or costs. All quotes must come from the Quote Engine.
- **Security**: No public exposure of worker nodes or databases. All ingress via Cloudflare/Tailscale.

## Stakeholder Roles

- **Broker**: Manages the pipeline, reviews AI-generated quotes, and handles human-escalated conversations.
- **AI Assistant (Nyra)**: Ingests leads, enrolls in campaigns, parses replies, drafts quotes, and flags hot leads.
- **Realtor**: Submits leads and receives status updates on their referrals.
- **Borrower**: Receives automated but approved messages and provides necessary documentation.
