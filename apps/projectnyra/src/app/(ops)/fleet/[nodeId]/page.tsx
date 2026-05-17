"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { fleetNodes, WorkerNodePage } from "@/components/fleet/fleet-control";

export default function FleetNodeRoute() {
  const params = useParams<{ nodeId: string }>();
  const node = fleetNodes.find((candidate) => candidate.id === params.nodeId);

  if (!node) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Fleet node not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Unknown Nerve worker</h1>
          <Link
            className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
            href="/fleet"
          >
            Return to Fleet Control
          </Link>
        </div>
      </main>
    );
  }

  return <WorkerNodePage node={node} />;
}
