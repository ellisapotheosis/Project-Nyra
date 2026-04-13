import { BorrowerChatWidget } from '@/components/BorrowerChatWidget';

const serviceLines = [
  {
    title: 'Purchase Mortgage Strategy',
    body:
      'Conventional, FHA, VA, jumbo, and down-payment assistance planning built around payment comfort, cash-to-close, and timeline readiness.',
  },
  {
    title: 'Refinance and Equity Planning',
    body:
      'Rate-and-term, cash-out refinance, and HELOC strategy with a plain-language breakdown of APR, monthly savings, and break-even timing.',
  },
  {
    title: 'Real Estate Coordination',
    body:
      'One advisory lane for financing, property search guidance, listing questions, and offer timing so borrowers are not bouncing between silos.',
  },
  {
    title: 'Branch-Level Support',
    body:
      'Borrower communication, pipeline clarity, and escalation paths designed to feel high-touch while remaining process-driven and compliant.',
  },
];

const borrowerBenefits = [
  'Plain-language guidance before you hand over documents',
  'Borrower-facing chat for questions about pre-approval, rates, and next steps',
  'Purchase, refinance, and investor scenarios supported in one experience',
  'Compliance-aware communication without overpromising approval outcomes',
];

const processSteps = [
  {
    title: 'Start with goals',
    body: 'Share what you are buying, refinancing, or comparing. We translate that into a financing game plan.',
  },
  {
    title: 'Map the numbers',
    body: 'Review payment targets, estimated cash to close, reserve strategy, and document requirements before you waste time.',
  },
  {
    title: 'Move with confidence',
    body: 'Use the borrower assistant for day-to-day questions while your application, property search, or rate strategy keeps moving.',
  },
];

const operatingPrinciples = [
  {
    label: 'Borrower-first',
    value: 'Education before pressure',
  },
  {
    label: 'Advisory style',
    value: 'Mortgage + real estate context together',
  },
  {
    label: 'Chat-ready',
    value: 'OpenClaw borrower assistant path',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="section-shell sticky top-4 z-30 rounded-full px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow text-[0.66rem] font-semibold text-[var(--brand)]">RateHunter Advisory</p>
              <p className="text-sm text-[var(--muted)]">
                Mortgage broker, real estate broker, and branch-led borrower support
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm text-[var(--brand-deep)]">
              <a className="rounded-full px-3 py-2 hover:bg-white/70" href="#services">
                Services
              </a>
              <a className="rounded-full px-3 py-2 hover:bg-white/70" href="#process">
                Process
              </a>
              <a className="rounded-full px-3 py-2 hover:bg-white/70" href="#assistant">
                Borrower Chat
              </a>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="section-shell overflow-hidden rounded-[2rem] p-8 md:p-12">
            <p className="eyebrow text-xs font-semibold text-[var(--accent)]">
              Purchase • Refinance • Investor • Listing-side coordination
            </p>
            <h1 className="display-copy mt-5 max-w-4xl text-5xl leading-[0.98] text-[var(--brand-deep)] md:text-7xl">
              Mortgage guidance that feels personal, disciplined, and ready to move.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              This landing experience is built for a borrower-facing advisory brand: mortgage planning, real
              estate context, and a chat assistant that can answer early questions before your team steps in.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#assistant"
                className="rounded-full bg-[var(--brand-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand)]"
              >
                Start with borrower chat
              </a>
              <a
                href="#process"
                className="rounded-full border border-[var(--line)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--brand-deep)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                See the process
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {operatingPrinciples.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.5rem] border border-[var(--line)] bg-white/65 px-5 py-4"
                >
                  <p className="eyebrow text-[0.68rem] font-semibold text-[var(--brand)]">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--brand-deep)]">{item.value}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="section-shell rounded-[2rem] p-6 md:p-8">
            <p className="eyebrow text-xs font-semibold text-[var(--accent)]">Why this page converts better</p>
            <div className="mt-5 space-y-4">
              {borrowerBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4"
                >
                  <p className="text-base font-medium leading-7 text-[var(--brand-deep)]">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.5rem] bg-[var(--brand-deep)] p-5 text-white">
              <p className="eyebrow text-[0.68rem] font-semibold text-[var(--accent-soft)]">Compliance posture</p>
              <p className="mt-3 text-sm leading-7 text-white/85">
                Educational guidance only. Rate, APR, payment, and approval terms remain subject to lender
                review, borrower profile, property profile, market conditions, and applicable regulation.
              </p>
            </div>
          </aside>
        </section>

        <section id="services" className="section-shell rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-xs font-semibold text-[var(--accent)]">Service lines</p>
              <h2 className="display-copy mt-2 text-4xl text-[var(--brand-deep)] md:text-5xl">
                One front door for financing and home-buying decisions.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
              The page is positioned for serious borrowers, homeowners, and referral partners who need clarity
              fast without the generic “compare rates in 30 seconds” treatment.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {serviceLines.map((service) => (
              <article
                key={service.title}
                className="rounded-[1.7rem] border border-[var(--line)] bg-white/75 p-6 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-44px_rgba(17,32,51,0.6)]"
              >
                <h3 className="text-2xl font-semibold text-[var(--brand-deep)]">{service.title}</h3>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">{service.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]" id="process">
          <div className="section-shell rounded-[2rem] p-8">
            <p className="eyebrow text-xs font-semibold text-[var(--accent)]">Borrower journey</p>
            <h2 className="display-copy mt-3 text-4xl text-[var(--brand-deep)]">A calmer path from first question to ready-to-act.</h2>
            <div className="mt-8 space-y-5">
              {processSteps.map((step, index) => (
                <article key={step.title} className="rounded-[1.6rem] border border-[var(--line)] bg-white/75 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-deep)] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--brand-deep)]">{step.title}</h3>
                      <p className="mt-2 text-base leading-7 text-[var(--muted)]">{step.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div id="assistant" className="section-shell rounded-[2rem] p-8">
            <p className="eyebrow text-xs font-semibold text-[var(--accent)]">Borrower assistant</p>
            <h2 className="display-copy mt-3 text-4xl text-[var(--brand-deep)]">
              OpenClaw-ready chat for borrower questions.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
              The bottom-right chat widget now defaults to an internal route, so Cloudflare Pages can host the
              UI cleanly while your backend points to OpenClaw, Open WebUI channels, or a streaming borrower
              assistant gateway behind the scenes.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.7rem] border border-[var(--line)] bg-white/70 p-5">
                <p className="eyebrow text-[0.68rem] font-semibold text-[var(--brand)]">Borrower persona</p>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  A dedicated borrower persona file now sits with this app so the public-facing assistant can
                  stay separate from the broker-facing internal AI workspace.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-[var(--line)] bg-white/70 p-5">
                <p className="eyebrow text-[0.68rem] font-semibold text-[var(--brand)]">Server-side relay</p>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  The proxy route keeps upstream URLs and API keys off the client while preserving streaming
                  responses for a borrower-friendly chat experience.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-semibold text-[var(--brand-deep)]">Suggested public use cases</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  'Pre-approval document checklist',
                  'Cash-to-close preparation',
                  'Purchase vs refinance framing',
                  'Rate vs APR education',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--muted)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell rounded-[2rem] p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow text-xs font-semibold text-[var(--accent)]">Conversion close</p>
              <h2 className="display-copy mt-3 text-4xl text-[var(--brand-deep)] md:text-5xl">
                Let the page educate, qualify, and route before a human handoff.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
                This version is static-first, Cloudflare-friendly, and intentionally written for trust. No fake
                urgency. No brittle live-feed hero. Just a professional borrower experience that can connect to
                your OpenClaw stack when the backend is ready.
              </p>
            </div>
            <div className="rounded-[1.8rem] bg-[var(--brand-deep)] p-6 text-white">
              <p className="eyebrow text-[0.68rem] font-semibold text-[var(--accent-soft)]">Important</p>
              <p className="mt-4 text-base leading-8 text-white/85">
                All borrower-facing messaging should remain educational and non-binding. Final pricing,
                qualification, and loan structure must come from the licensed process and lender decisioning
                flow.
              </p>
            </div>
          </div>
        </section>
      </div>

      <BorrowerChatWidget />
    </main>
  );
}
