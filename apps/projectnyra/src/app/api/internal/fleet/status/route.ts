import { NextResponse } from "next/server";

const workers = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Control Plane",
    healthUrl:
      process.env.ORCHESTRATOR_HEALTH_URL ??
      "http://orchestrator.trex-fiordland.ts.net:6000/health",
  },
  {
    id: "worker-rtx5090",
    name: "Worker RTX 5090",
    role: "Primary vLLM",
    healthUrl:
      process.env.WORKER_5090_HEALTH_URL ??
      "http://worker-rtx5090.trex-fiordland.ts.net:8000/health",
  },
  {
    id: "worker-rtx3090ti",
    name: "Worker RTX 3090 Ti",
    role: "Secondary vLLM",
    healthUrl:
      process.env.WORKER_3090TI_HEALTH_URL ??
      "http://worker-rtx3090ti.trex-fiordland.ts.net:8000/health",
  },
  {
    id: "worker-rtx3060",
    name: "Worker RTX 3060",
    role: "Utility Ollama",
    healthUrl:
      process.env.WORKER_3060_HEALTH_URL ??
      "http://worker-rtx3060.trex-fiordland.ts.net:11434/api/tags",
  },
];

export async function GET() {
  return NextResponse.json({
    overallHealth: "configured",
    workers,
    source: "webapp-adapter",
    lastCheckAt: new Date().toISOString(),
  });
}
