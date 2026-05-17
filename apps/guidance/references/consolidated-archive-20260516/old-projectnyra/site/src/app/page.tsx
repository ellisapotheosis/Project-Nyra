const loop = [
  "Lead captured",
  "Normalized and deduped",
  "TwentyCRM record",
  "Campaign enrolled",
  "Borrower replies",
  "Quote generated",
  "Docs requested",
  "Event logged",
];

const modules = [
  [
    "Borrower command page",
    "A single protected view for lead state, tasks, quote status, and next broker action.",
  ],
  [
    "Unified communication timeline",
    "SMS, email, calls, approvals, campaign events, and audit records in one chronology.",
  ],
  [
    "Campaign Builder V2",
    "Broker-controlled campaign enrollment with reply pauses, STOP handling, and quiet-hours rules.",
  ],
  [
    "Quote desk",
    "Three-option quote workflows sourced from the quote service, never improvised by the assistant.",
  ],
  [
    "Compliance service",
    "Consent, suppression, unsubscribe, first-response pause, and approval gates as explicit logic.",
  ],
  [
    "Communication service",
    "Provider send/receive logging, callbacks, and CRM timeline sync.",
  ],
  [
    "Assistant / OpenClaw layer",
    "Nyra drafts, inspects, and recommends, while mutations flow through service boundaries.",
  ],
  [
    "Integration health",
    "TwentyCRM, Twilio, SendGrid, Nexus, model routing, and workflow health in one operator lane.",
  ],
];

const integrations = [
  "TwentyCRM",
  "Supabase",
  "Twilio",
  "SendGrid",
  "n8n",
  "Activepieces optional",
  "OpenClaw",
  "LiteLLM",
  "Nexus Router",
  "Cloudflare",
  "Tailscale",
  "Docker",
];

export default function ProjectNyraSite() {
  return (
    <main className="site-shell">
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Project Nyra product domain</span>
          <h1>
            Project <span className="hero-gradient">Nyra</span>
          </h1>
          <p className="hero-copy">
            AI mortgage operations system for brokers who need lead capture,
            compliant communication, quote workflows, CRM synchronization, and
            assistant-guided execution without turning the assistant into the
            system of record.
          </p>
          <div className="actions">
            <a className="button" href="#command-center">
              Explore the command center
            </a>
            <a className="button secondary" href="#architecture">
              View architecture
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="architecture">
        <div className="section-inner">
          <span className="eyebrow">System thesis</span>
          <h2 className="section-title">
            Not another CRM. Not another drip tool.
          </h2>
          <p className="section-copy">
            Nyra is the broker command center from first lead capture to closed
            loan. TwentyCRM remains the system of record, the campaign and
            compliance services own business rules, and OpenClaw acts as the
            assistant layer that drafts, inspects, and routes work through
            approved boundaries.
          </p>
          <div className="grid three">
            <article className="card">
              <strong>CRM stays authoritative</strong>
              <p>
                Nyra reads and updates CRM records through service contracts
                instead of letting chat mutate data directly.
              </p>
            </article>
            <article className="card">
              <strong>Compliance is code</strong>
              <p>
                STOP, unsubscribe, consent, quiet hours, broker approval, and
                audit logging are visible platform states.
              </p>
            </article>
            <article className="card">
              <strong>Workflow glue stays replaceable</strong>
              <p>
                n8n and Activepieces may execute automation, but they do not
                become the business brain.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Operating loop</span>
          <h2 className="section-title">
            Every borrower event has a state, owner, and audit trail.
          </h2>
          <div className="loop">
            {loop.map((step, index) => (
              <div className="loop-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Core modules</span>
          <h2 className="section-title">
            The command surface for a mortgage operating system.
          </h2>
          <div className="grid four">
            {modules.map(([title, copy]) => (
              <article className="card" key={title}>
                <strong>{title}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Integration ecosystem</span>
          <h2 className="section-title">
            Built around real mortgage infrastructure, not fake autonomy claims.
          </h2>
          <p className="section-copy">
            Nyra connects the tools a broker already needs while keeping public
            ingress, worker inference, secrets, and internal provider endpoints
            behind the right boundaries.
          </p>
          <div className="integrations">
            {integrations.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <span className="eyebrow">Compliance spine</span>
          <h2 className="section-title">
            Approval before borrower-facing action.
          </h2>
          <div className="grid three">
            {[
              "Consent ledger",
              "STOP handling",
              "Quiet hours",
              "Unsubscribe",
              "First-response campaign pause",
              "Broker approval",
              "Deterministic quotes",
            ].map((item) => (
              <article className="card" key={item}>
                <strong>{item}</strong>
                <p>
                  Tracked as an explicit workflow condition with audit
                  visibility.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="command-center">
        <div className="section-inner">
          <span className="eyebrow">Command center preview</span>
          <h2 className="section-title">
            Lead inbox, borrower timeline, campaign builder, quote desk,
            assistant drawer.
          </h2>
          <div className="preview">
            <div className="dossier card">
              <strong>Lead dossier</strong>
              {[
                "Pipeline: First response",
                "Consent: SMS allowed",
                "Campaign: Purchase nurture",
                "Quote: Pending broker review",
              ].map((row) => (
                <div className="timeline-row" key={row}>
                  <span>{row}</span>
                  <span>Live</span>
                </div>
              ))}
            </div>
            <div className="dossier card">
              <strong>OpenClaw assistant</strong>
              {[
                "Read lead from TwentyCRM",
                "Score lead intent",
                "Draft response",
                "Request approval",
                "Log audit event",
              ].map((row) => (
                <div className="timeline-row" key={row}>
                  <span>{row}</span>
                  <span>Queued</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-zone">
        <div className="section-inner">
          <span className="eyebrow">Product boundary</span>
          <h2 className="section-title">
            Public brand site here. Broker command center at
            app.projectnyra.com.
          </h2>
          <p className="section-copy">
            This page explains Project Nyra. It does not expose CRM routes, n8n,
            Twenty internals, OpenClaw admin tools, provider secrets, or raw
            infrastructure endpoints.
          </p>
        </div>
      </section>
    </main>
  );
}
