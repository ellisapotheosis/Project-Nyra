# Product Definition: Project Nyra

## Vision

Project Nyra is an AI-powered mortgage lead automation and broker operations platform. It bridges the gap between lead generation and loan fulfillment by automating lead intake, normalization, compliant multi-channel follow-up, and deterministic mortgage quote generation. The ultimate goal is to become the broker's operational singularity—a fast, command-based surface for every lead, quote, campaign, and AI action.

## Target Audience

- **Mortgage Brokers:** The primary users who need an all-in-one command center to manage their lead pipeline and automate outreach without losing the "human touch."
- **Borrowers/Customers:** The secondary users who interact with the landing page and receive automated communications and quotes.
- **Admin/Operators:** Internal users who manage system integrations, compliance, and infrastructure.

## Core Features

- **Intelligent Lead Ingestion:** Automated capture from landing pages, emails, and APIs with normalization and deduplication into Twenty CRM.
- **Dynamic Campaign Engine:** Mortgage-specific drip campaigns (SMS, email, voicemail, calls) with immediate STOP/reply/unsubscribe kill-switch behavior and quiet-hour enforcement.
- **Deterministic Quote Desk:** Three-option mortgage scenarios generated via a Python/FastAPI service with broker approval gates.
- **OpenClaw Broker Assistant:** Integrated AI assistant for summarizing lead history, recommending actions, and drafting compliant messages.
- **Lead Cockpit:** A unified timeline and profile view for every lead, including consent state, campaign status, and communication logs.
- **Infrastructure:** Control-plane (Orchestrator/Oracle VPS) and Compute-plane (GPU Workers) architecture for private local AI inference.

## Success Metrics

- **Conversion Velocity:** Reduction in time from lead capture to broker-approved quote.
- **Operational Efficiency:** Number of leads managed per broker without increasing manual effort.
- **Compliance Integrity:** Zero messages sent after a STOP/unsubscribe event and 100% adherence to quiet hours.
- **System Reliability:** 99.9% uptime for core lead ingestion and campaign execution services.

## Strategic Objectives (North Star)

- **CRM as System of Record:** Twenty CRM owns the business ledger.
- **Compliance as Code:** Compliance logic is explicit service logic, not just prompts.
- **Deterministic AI:** Assistants must not invent rates or financial terms; all quotes come from the quote service.
- **Private Compute:** Heavy AI tasks run on private GPU workers over Tailscale.
