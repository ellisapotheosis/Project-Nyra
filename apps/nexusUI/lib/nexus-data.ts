export type ProbeStatus = "healthy" | "degraded" | "offline" | "unknown";

export type ServiceProbe = {
  id: string;
  name: string;
  url: string;
  path: string;
  purpose: string;
  access: "private" | "access-gated" | "pages";
  kind: "router" | "model-proxy" | "observability" | "worker-ui" | "integration";
};

export type WorkerNode = {
  id: string;
  name: string;
  host: string;
  gpu: string;
  role: string;
  status: "online" | "standby" | "disconnected";
  heartbeat: string;
  nerveUrl: string;
  notes: string[];
};

export type ControlSurface = {
  id: string;
  name: string;
  href: string;
  access: "public" | "access-gated" | "private" | "pages";
  purpose: string;
};

export type ModelProvider = {
  id: string;
  name: string;
  kind: "cloud" | "local" | "routing" | "assistant";
  endpoint: string;
  status: "enabled" | "standby" | "offline";
  notes: string[];
};

export const serviceProbes: ServiceProbe[] = [
  {
    id: "nexus-router",
    name: "Nexus Router",
    url: process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "https://nexus-router.projectnyra.com",
    path: "/health",
    purpose: "MCP entrypoint and routing plane",
    access: "access-gated",
    kind: "router",
  },
  {
    id: "nexus-ui",
    name: "Nexus UI",
    url: process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? "https://nexus.projectnyra.com",
    path: "/",
    purpose: "Operator console for desired state and controls",
    access: "access-gated",
    kind: "integration",
  },
  {
    id: "litellm",
    name: "LiteLLM",
    url: process.env.NEXT_PUBLIC_LITELLM_URL ?? "http://oracle.trex-fiordland.ts.net:4000",
    path: "/health",
    purpose: "Model proxy and provider routing",
    access: "private",
    kind: "model-proxy",
  },
  {
    id: "grafana",
    name: "Grafana",
    url: process.env.NEXT_PUBLIC_GRAFANA_URL ?? "https://grafana.projectnyra.com",
    path: "/api/health",
    purpose: "Dashboards and alerting surfaces",
    access: "access-gated",
    kind: "observability",
  },
  {
    id: "prometheus",
    name: "Prometheus",
    url: process.env.NEXT_PUBLIC_PROMETHEUS_URL ?? "https://prometheus.projectnyra.com",
    path: "/-/healthy",
    purpose: "Metrics collection",
    access: "private",
    kind: "observability",
  },
  {
    id: "loki",
    name: "Loki",
    url: process.env.NEXT_PUBLIC_LOKI_URL ?? "https://loki.projectnyra.com",
    path: "/ready",
    purpose: "Log aggregation",
    access: "private",
    kind: "observability",
  },
  {
    id: "openlit",
    name: "OpenLIT",
    url: process.env.NEXT_PUBLIC_OPENLIT_URL ?? "https://openlit.projectnyra.com",
    path: "/health",
    purpose: "LLM telemetry and tracing",
    access: "access-gated",
    kind: "observability",
  },
  {
    id: "worker-5090-ui",
    name: "Nerve UI 5090",
    url: process.env.NEXT_PUBLIC_WORKER_5090_URL ?? "http://worker-rtx5090.trex-fiordland.ts.net:8000",
    path: "/health",
    purpose: "RTX 5090 operator and workload view",
    access: "private",
    kind: "worker-ui",
  },
  {
    id: "worker-3090-ui",
    name: "Nerve UI 3090 Ti",
    url: process.env.NEXT_PUBLIC_WORKER_3090TI_URL ?? "http://worker-rtx3090ti.trex-fiordland.ts.net:8000",
    path: "/health",
    purpose: "RTX 3090 Ti operator and workload view",
    access: "private",
    kind: "worker-ui",
  },
  {
    id: "worker-3060-ui",
    name: "Nerve UI 3060",
    url: process.env.NEXT_PUBLIC_WORKER_3060_URL ?? "http://worker-rtx3060.trex-fiordland.ts.net:8000",
    path: "/health",
    purpose: "RTX 3060 worker and utility view",
    access: "private",
    kind: "worker-ui",
  },
];

export const controlSurfaces: ControlSurface[] = [
  {
    id: "projectnyra",
    name: "Project Nyra App",
    href: process.env.NEXT_PUBLIC_WEBAPP_URL ?? "https://app.projectnyra.com",
    access: "access-gated",
    purpose: "Broker app, product routes, and customer workflows",
  },
  {
    id: "projectnyra-home",
    name: "Project Nyra Home",
    href: process.env.NEXT_PUBLIC_PROJECT_URL ?? "https://projectnyra.com",
    access: "pages",
    purpose: "Public landing page and platform entry",
  },
  {
    id: "nexus-ui",
    name: "Nexus UI",
    href: process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? "https://nexus.projectnyra.com",
    access: "access-gated",
    purpose: "Router controls, model routing, and MCP inventory",
  },
  {
    id: "nexus-router",
    name: "Nexus Router MCP",
    href: process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "https://nexus-router.projectnyra.com",
    access: "access-gated",
    purpose: "Direct MCP entrypoint for tool calls and router handshakes",
  },
  {
    id: "openmemory",
    name: "OpenMemory UI",
    href: process.env.NEXT_PUBLIC_OPENMEMORY_URL ?? "https://openmemory.projectnyra.com",
    access: "access-gated",
    purpose: "Memory tooling and shared memory observability",
  },
];

export const modelProviders: ModelProvider[] = [
  {
    id: "litellm",
    name: "LiteLLM",
    kind: "routing",
    endpoint: process.env.NEXT_PUBLIC_LITELLM_URL ?? "http://oracle.trex-fiordland.ts.net:4000",
    status: "enabled",
    notes: ["Provider routing proxy", "Budget and fallback policy", "Local/private by default"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    kind: "cloud",
    endpoint: "https://openrouter.ai/api/v1",
    status: "enabled",
    notes: ["Cloud model access", "Use through LiteLLM", "Keep token references server-side"],
  },
  {
    id: "vybestack-jefe",
    name: "VYBESTACK / LLXPRT-JEFE",
    kind: "assistant",
    endpoint: "private subscription-backed route",
    status: "standby",
    notes: ["Operator choice routing", "LLXPRT-backed", "Keep off public exposure"],
  },
  {
    id: "vybestack-code",
    name: "VYBESTACK / LLXPRT-CODE",
    kind: "assistant",
    endpoint: "private subscription-backed route",
    status: "standby",
    notes: ["Coding lane", "Can be disconnected on worker 5090", "Prefer private transport"],
  },
  {
    id: "letta",
    name: "Letta",
    kind: "assistant",
    endpoint: "memory-manager orchestration lane",
    status: "standby",
    notes: ["Memory manager", "No direct system-of-record writes", "Use through Nexus"],
  },
  {
    id: "waveterm",
    name: "WaveTerm",
    kind: "local",
    endpoint: "desktop operator shell",
    status: "enabled",
    notes: ["Local operator terminal", "Useful for live ops", "Keep private"],
  },
  {
    id: "zellij",
    name: "Zellij",
    kind: "local",
    endpoint: "workspace orchestration panes",
    status: "enabled",
    notes: ["Pane orchestration", "Private local tool", "Useful for worker control"],
  },
];

export const workerNodes: WorkerNode[] = [
  {
    id: "worker-rtx5090",
    name: "worker-rtx5090",
    host: process.env.NEXT_PUBLIC_WORKER_5090_HOST ?? "worker-rtx5090.trex-fiordland.ts.net",
    gpu: "RTX 5090",
    role: "Primary high-throughput model host",
    status: "online",
    heartbeat: "1m ago",
    nerveUrl: process.env.NEXT_PUBLIC_WORKER_5090_URL ?? "http://worker-rtx5090.trex-fiordland.ts.net:8000",
    notes: ["Disconnectable lane", "Best for heavy sessions", "Can be powered by LLXPRT subscription"],
  },
  {
    id: "worker-rtx3090ti",
    name: "worker-rtx3090ti",
    host: process.env.NEXT_PUBLIC_WORKER_3090TI_HOST ?? "worker-rtx3090ti.trex-fiordland.ts.net",
    gpu: "RTX 3090 Ti",
    role: "Secondary local model host and chat UI lane",
    status: "online",
    heartbeat: "2m ago",
    nerveUrl: process.env.NEXT_PUBLIC_WORKER_3090TI_URL ?? "http://worker-rtx3090ti.trex-fiordland.ts.net:8000",
    notes: ["OpenClaw or Hermes lane", "Good always-on worker", "Private only"],
  },
  {
    id: "worker-rtx3060",
    name: "worker-rtx3060",
    host: process.env.NEXT_PUBLIC_WORKER_3060_HOST ?? "worker-rtx3060.trex-fiordland.ts.net",
    gpu: "RTX 3060",
    role: "Embeddings, extraction, and background utility worker",
    status: "standby",
    heartbeat: "6m ago",
    nerveUrl: process.env.NEXT_PUBLIC_WORKER_3060_URL ?? "http://worker-rtx3060.trex-fiordland.ts.net:8000",
    notes: ["Utility and summarization tasks", "Lower priority", "Keep private"],
  },
];

export const routeSplit = [
  { label: "projectnyra.com", detail: "Public landing page on Cloudflare Pages", badge: "public" },
  { label: "app.projectnyra.com", detail: "Main broker app and product routes", badge: "access-gated" },
  { label: "nexus.projectnyra.com", detail: "Separate control-plane UI", badge: "access-gated" },
  { label: "nexus-router.projectnyra.com", detail: "Direct MCP entrypoint", badge: "access-gated" },
  { label: "openmemory.projectnyra.com", detail: "Memory UI / tools", badge: "access-gated" },
  { label: "grafana.projectnyra.com", detail: "Observability dashboards", badge: "access-gated" },
];

export function counts() {
  return {
    controls: controlSurfaces.length,
    workers: workerNodes.length,
    providers: modelProviders.length,
    probes: serviceProbes.length,
  };
}
