import Link from "next/link";
import { headers } from "next/headers";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Database,
  Network,
  RadioTower,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MemoryStatusResponse = {
  services: Array<{
    name: string;
    role: string;
    urlEnv: string;
    url: string;
    status: "configured" | "online" | "degraded" | "unconfigured";
    latencyMs: number | null;
    detail: string;
  }>;
  summary: {
    total: number;
    configured: number;
    online: number;
    generatedAt: string;
  };
};

const fallbackStatus: MemoryStatusResponse = {
  services: [],
  summary: {
    total: 0,
    configured: 0,
    online: 0,
    generatedAt: new Date().toISOString(),
  },
};

const operatorLinks = [
  {
    label: "OpenMemory",
    href:
      process.env.NEXT_PUBLIC_OPENMEMORY_URL ??
      "https://openmemory.projectnyra.com",
    icon: BrainCircuit,
  },
  {
    label: "Nexus Router",
    href:
      process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ??
      "https://nexus-router.projectnyra.com",
    icon: RadioTower,
  },
  {
    label: "Qdrant",
    href: process.env.NEXT_PUBLIC_QDRANT_URL ?? "https://qdrant.projectnyra.com",
    icon: Database,
  },
  {
    label: "FalkorDB",
    href:
      process.env.NEXT_PUBLIC_FALKORDB_URL ??
      "https://falkordb.projectnyra.com",
    icon: Network,
  },
];

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  const status = await getMemoryStatus();
  const monitored = status.services.filter(
    (service) => service.status !== "unconfigured"
  );
  const degraded = status.services.filter(
    (service) => service.status === "degraded"
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5 rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Memory UI
            </Badge>
            <Badge variant="outline" className="rounded-full">
              OpenMemory, mem0, memOS, Qdrant, FalkorDB
            </Badge>
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance">
              Memory operations console for visual review and backend health.
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              OpenMemory remains the visual management surface. mem0 is the
              primary read/write memory endpoint, backed by Qdrant vectors and
              FalkorDB graph relationships, while memOS is tracked as an
              experimental memory-tensor service behind Nexus.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={
                process.env.NEXT_PUBLIC_OPENMEMORY_URL ??
                "https://openmemory.projectnyra.com"
              }
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({}))}
            >
              Open OpenMemory
              <ArrowRight className="size-4" />
            </a>
            <Link
              href="/nexus"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Nexus Console
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <MetricCard
            label="Configured"
            value={`${status.summary.configured}/${status.summary.total}`}
            detail="Memory services with URLs"
            icon={BrainCircuit}
          />
          <MetricCard
            label="Online"
            value={`${status.summary.online}`}
            detail="Responding during this request"
            icon={ShieldCheck}
          />
          <MetricCard
            label="Degraded"
            value={`${degraded.length}`}
            detail="Configured but unavailable"
            icon={Activity}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {operatorLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border border-border/70 bg-card/70 p-4 transition-colors hover:bg-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Icon className="size-5 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{label}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Protected memory endpoint
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </a>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <BrainCircuit className="size-4" />
              Memory Health Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Latency</th>
                  <th className="px-3 py-3">Env</th>
                  <th className="px-3 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {status.services.map((service) => (
                  <tr key={service.name}>
                    <td className="px-3 py-3 font-medium">{service.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {service.role}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          service.status === "online"
                            ? "secondary"
                            : "outline"
                        }
                        className={cn(
                          "capitalize",
                          service.status === "degraded" && "text-destructive"
                        )}
                      >
                        {service.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {service.latencyMs === null
                        ? "-"
                        : `${service.latencyMs}ms`}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {service.urlEnv}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {service.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Memory Contract
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Nexus Router is the single agent-facing endpoint. Memory writes
              route to mem0, vector search persists in Qdrant, graph context
              persists in FalkorDB, and OpenMemory provides visual inspection.
            </p>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Monitored now
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {monitored.length}
              </p>
              <p className="text-xs">
                Add URL env vars to increase live coverage.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

async function getMemoryStatus(): Promise<MemoryStatusResponse> {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host") ?? "127.0.0.1:3100";
    const protocol = host.startsWith("localhost") || host.startsWith("127.")
      ? "http"
      : "https";
    const baseUrl = `${protocol}://${host}`;
    const response = await fetch(`${baseUrl}/api/memory/status`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackStatus;
    }

    return response.json();
  } catch {
    return fallbackStatus;
  }
}
