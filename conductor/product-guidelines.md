# Product Guidelines: Project Nyra

## UI/UX Principles

- **High-Signal Broker Ops Aesthetic:** Aim for a clean, professional look that balances the data density of Airtable/Notion with the speed of a command center.
- **Command-First Workflow:** Prioritize fast navigation and action execution through a global command palette and keyboard shortcuts.
- **Compliance Visibility:** Every communication interface must clearly show the lead's compliance state (consent, DNC, quiet hours, STOP status).
- **Proactive AI Assistance:** The AI assistant should provide "proposed action" cards for broker approval rather than performing silent mutations.
- **Deterministic Transparency:** Financial terms and quotes must show the assumptions ledger and require explicit broker approval before delivery.

## Design System & Tokens

- **Foundations:** Next.js App Router, Tailwind CSS, shadcn/ui, Magic UI.
- **Theming:** Use TweakCN OKLCH themes. Avoid random hex colors; strictly adhere to theme variables.
- **Icons:** Use Lucide icons consistently across all surfaces.
- **Notifications:** Use `sonner` for high-signal, non-intrusive compliance and system notifications.

## Functional Standards

- **Unified Timeline:** Every lead cockpit must feature a unified chronological view of all SMS, emails, calls, voicemail drops, and system events.
- **Service Health Strip:** Include a live status indicator for core integrations (Twenty, Twilio, quote-api, worker nodes).
- **Embedded Tool Panels:** Provide safe, embedded access to internal tools (Nexus, Activepieces, n8n) without forcing them into the primary broker UI.

## Language and Prose

- **Clarity and Precision:** Use mortgage-industry standard terminology. Avoid "cutesy" or overly conversational AI personas.
- **Direct Tone:** Error messages and system states should be technical and actionable.
