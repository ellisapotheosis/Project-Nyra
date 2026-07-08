"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Cloud,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  LockKeyhole,
  MonitorSmartphone,
  Network,
  RefreshCcw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";

import {
  controlSurfaces,
  counts,
  modelProviders,
  routeSplit,
  serviceProbes,
  workerNodes,
  type ProbeStatus,
} from "@/lib/nexus-data";

type ProbeRecord = {
  id: string;
  status: ProbeStatus;
  httpStatus?: number;
  checkedAt?: string;
  latencyMs?: number;
  error?: string;
};

type StatusResponse = {
  checkedAt: string;
  probes: ProbeRecord[];
};

const sections = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "router", label: "Router", icon: Network },
  { id: "observability", label: "Observability", icon: Activity },
  { id: "workers", label: "Workers", icon: MonitorSmartphone },
  { id: "integrations", label: "Integrations", icon: Database },
  { id: "access", label: "Access", icon: LockKeyhole },
];

function badgeClass(status: ProbeStatus | string) {
  if (status === "healthy" || status === "enabled" || status === "online") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "degraded" || status === "standby") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }

  if (status === "offline" || status === "disconnected") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-100";
  }

  return "border-slate-400/30 bg-slate-400/10 text-slate-200";
}

function findProbe(status: ProbeRecord[], id: string) {
  return status.find((probe) => probe.id === id);
}

function toDisplayStatus(value?: ProbeStatus | string) {
  if (!value) {
    return "unknown";
  }

  return value;
}

export function NexusConsole() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [probes, setProbes] = useState<ProbeRecord[]>([]);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => counts(), []);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Status check failed with ${response.status}`);
      }

      const json = (await response.json()) as StatusResponse;
      setProbes(json.probes);
      setCheckedAt(json.checkedAt);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {
      // handled in refresh
    });
  }, []);

  const healthyCount = probes.filter((probe) => probe.status === "healthy").length;
  const accessCount = serviceProbes.filter((probe) => probe.access === "access-gated").length;
  const privateCount = serviceProbes.filter((probe) => probe.access === "private").length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]">
      <header className="border-b border-border/50 bg-background/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                  <Network className="size-5" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                    Project Nyra control plane
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Nexus Router and operator console
                  </h1>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Separate from the broker app. This surface owns router intent,
                observability links, worker views, and access-gated control-plane
                status for the Project Nyra stack.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                href={process.env.NEXT_PUBLIC_WEBAPP_URL ?? "https://app.projectnyra.com"}
                target="_blank"
                rel="noreferrer"
              >
                <Sparkles className="size-4" />
                App
              </a>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                onClick={() => refresh().catch(() => undefined)}
                type="button"
              >
                <RefreshCcw className="size-4" />
                Refresh
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                <ShieldCheck className="size-4" />
                Access-gated
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard title="Live probes" value={`${healthyCount}/${summary.probes}`} icon={Activity} />
            <MetricCard title="Control surfaces" value={`${summary.controls}`} icon={Layers3} />
            <MetricCard title="Private services" value={`${privateCount}`} icon={LockKeyhole} />
            <MetricCard title="Access-gated routes" value={`${accessCount}`} icon={Cloud} />
          </div>

          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                    active
                      ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-100"
                      : "border-border/60 bg-card/70 text-muted-foreground hover:border-cyan-400/30 hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-card px-3 py-1">
              Last checked {checkedAt ?? "not yet"}
            </span>
            {loading ? (
              <span className="rounded-full border border-border/60 bg-card px-3 py-1">
                refreshing
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:px-8">
        {activeSection === "overview" ? (
          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card title="Route split" icon={GitBranch} description="Public landing stays on Cloudflare Pages. App, control-plane, and internal tooling stay separated by hostname and access boundary.">
              <div className="grid gap-3">
                {routeSplit.map((route) => (
                  <div key={route.label} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">{route.label}</p>
                      <p className="text-sm text-muted-foreground">{route.detail}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs ${badgeClass(route.badge)}`}>{route.badge}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Operator priorities" icon={Wand2} description="The Nexus UI owns desired state, not raw secrets. Use this console to steer router intent and keep control-plane surfaces private.">
              <div className="grid gap-3 text-sm text-muted-foreground">
                <PillLine title="Nexus Router" value="MCP entrypoint and downstream tool router" />
                <PillLine title="LiteLLM" value="Model proxy and provider policy layer" />
                <PillLine title="OpenLIT" value="LLM telemetry and trace visibility" />
                <PillLine title="Grafana / Prometheus / Loki" value="Observability and alerting stack" />
                <PillLine title="Workers" value="RTX 5090, 3090 Ti, and 3060 remain private over Tailscale" />
              </div>
            </Card>

            <Card title="Service inventory" icon={Server} description="Current probes and operational status for the stack.">
              <div className="grid gap-3 md:grid-cols-2">
                {serviceProbes.map((probe) => {
                  const live = findProbe(probes, probe.id);
                  return (
                    <div key={probe.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{probe.name}</p>
                          <p className="text-sm text-muted-foreground">{probe.purpose}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs ${badgeClass(toDisplayStatus(live?.status))}`}>
                          {live ? live.status : "unknown"}
                        </span>
                      </div>
                      <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{probe.url}{probe.path}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Worker nodes" icon={MonitorSmartphone} description="Private GPU nodes, each with a different lane and failure mode.">
              <div className="grid gap-3 md:grid-cols-3">
                {workerNodes.map((worker) => (
                  <div key={worker.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">{worker.gpu}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${badgeClass(worker.status)}`}>{worker.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{worker.role}</p>
                    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                      <p>Host: {worker.host}</p>
                      <p>Heartbeat: {worker.heartbeat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : null}

        {activeSection === "router" ? (
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card title="Routing policy" icon={Network} description="Desired-state controls for model routing and tool discovery.">
              <div className="grid gap-3">
                <ControlRow label="Policy" value="balanced by default, privacy-first for sensitive work" />
                <ControlRow label="Default model" value="Claude / code-primary via LiteLLM" />
                <ControlRow label="Fallback model" value="OpenRouter or local worker based on lane" />
                <ControlRow label="Tool discovery" value="Fuzzy search enabled for operator workflows" />
                <ControlRow label="Allowlist" value="Explicit model allowlist preferred" />
              </div>
            </Card>

            <Card title="Model surfaces" icon={Bot} description="Primary LLM/provider lanes for the stack.">
              <div className="grid gap-3">
                {modelProviders.map((provider) => (
                  <div key={provider.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.endpoint}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${badgeClass(provider.status)}`}>{provider.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {provider.notes.map((note) => (
                        <span key={note} className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : null}

        {activeSection === "observability" ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <Card title="Observability links" icon={Activity} description="Fast jump points for dashboards and telemetry surfaces.">
              <div className="grid gap-3">
                {serviceProbes
                  .filter((probe) => probe.kind === "observability")
                  .map((probe) => (
                    <a
                      key={probe.id}
                      href={probe.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                    >
                      <div>
                        <p className="font-medium">{probe.name}</p>
                        <p className="text-sm text-muted-foreground">{probe.purpose}</p>
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </a>
                  ))}
              </div>
            </Card>

            <Card title="Nerve UI and worker visibility" icon={Gauge} description="These surfaces stay private and are linked from the control plane only.">
              <div className="grid gap-3">
                {serviceProbes
                  .filter((probe) => probe.kind === "worker-ui")
                  .map((probe) => (
                    <div key={probe.id} className="rounded-lg border border-border/60 bg-background/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{probe.name}</p>
                          <p className="text-sm text-muted-foreground">{probe.purpose}</p>
                        </div>
                        <span className="rounded-full border border-slate-400/30 bg-slate-400/10 px-3 py-1 text-xs text-slate-100">
                          private
                        </span>
                      </div>
                      <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{probe.url}</p>
                    </div>
                  ))}
              </div>
            </Card>
          </section>
        ) : null}

        {activeSection === "workers" ? (
          <section className="grid gap-6">
            <Card title="Worker status" icon={MonitorSmartphone} description="GPU nodes, their job lanes, and the access boundary around each box.">
              <div className="grid gap-4 xl:grid-cols-3">
                {workerNodes.map((worker) => (
                  <div key={worker.id} className="rounded-xl border border-border/60 bg-background/60 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">{worker.gpu}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${badgeClass(worker.status)}`}>{worker.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{worker.role}</p>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {worker.notes.map((note) => (
                        <div key={note} className="rounded-lg border border-border/60 bg-card px-3 py-2">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : null}

        {activeSection === "integrations" ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <Card title="Control surfaces" icon={SlidersHorizontal} description="Where each surface belongs in the product split.">
              <div className="grid gap-3">
                {controlSurfaces.map((surface) => (
                  <a
                    key={surface.id}
                    href={surface.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{surface.name}</p>
                      <p className="text-sm text-muted-foreground">{surface.purpose}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs ${badgeClass(surface.access)}`}>{surface.access}</span>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </Card>

            <Card title="Core integrations" icon={Sparkles} description="The surrounding stack this console should keep visible.">
              <div className="grid gap-3">
                <IntegrationRow title="Nexus Router" value="MCP gateway, tool router, and model policy entrypoint" />
                <IntegrationRow title="LiteLLM" value="Provider proxy and budget/fallback control" />
                <IntegrationRow title="OpenMemory" value="Memory tooling and shared context surfaces" />
                <IntegrationRow title="Supabase" value="Local Oracle VPS backend and auth for the broker app" />
                <IntegrationRow title="Cloudflared / Access" value="Public ingress for only the intended hostnames" />
              </div>
            </Card>
          </section>
        ) : null}

        {activeSection === "access" ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <Card title="Hostname policy" icon={Cloud} description="Keep the split explicit: public landing on Pages, app on app.projectnyra.com, operator consoles on access-gated hostnames.">
              <div className="grid gap-3">
                <ControlRow label="projectnyra.com" value="Public landing page" />
                <ControlRow label="app.projectnyra.com" value="Main product app" />
                <ControlRow label="nexus.projectnyra.com" value="Nexus UI control plane" />
                <ControlRow label="nexus-router.projectnyra.com" value="Router MCP endpoint" />
                <ControlRow label="openmemory.projectnyra.com" value="OpenMemory UI" />
                <ControlRow label="grafana.projectnyra.com" value="Access-gated observability" />
              </div>
            </Card>

            <Card title="Security posture" icon={ShieldCheck} description="The control plane stays private, the worker boxes stay private, and live infra changes stay operator-controlled.">
              <div className="grid gap-3">
                <ControlRow label="Cloudflare Access" value="Required for admin/control-plane hostnames" />
                <ControlRow label="Tailscale" value="Private worker transport and MagicDNS" />
                <ControlRow label="Secrets" value="Infisical-backed, not in browser state" />
                <ControlRow label="Raw endpoints" value="No public Postgres, Redis, or worker inference" />
                <ControlRow label="UI mutability" value="Desired-state console only; no live secret material" />
              </div>
            </Card>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Gauge;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="size-4 text-cyan-200" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Card({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Gauge;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
          <Icon className="size-4" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function PillLine({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 px-4 py-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-[70%] text-right text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function ControlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/60 px-4 py-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="max-w-[70%] text-right text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function IntegrationRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="font-medium">{title}</p>
        <span className="rounded-full border border-slate-400/30 bg-slate-400/10 px-3 py-1 text-xs text-slate-100">
          linked
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
