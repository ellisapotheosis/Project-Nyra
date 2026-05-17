import { createClient } from "./base";
import { serviceConfig } from "./config";

export interface MemoryOverview {
  totalMemories: number;
  leadMemories: number;
  campaignMemories: number;
  agentMemories: number;
  systemMemories: number;
  recentWrites: number;
  failedWrites: number;
  averageConfidence: number;
}

export interface MemoryNode {
  id: string;
  type: "LEAD" | "CAMPAIGN" | "EVENT" | "AGENT" | "SYSTEM";
  label: string;
  geometry:
    | "TETRAHEDRON"
    | "CUBE"
    | "OCTAHEDRON"
    | "DODECAHEDRON"
    | "ICOSAHEDRON";
  color: string;
  status?: "ACTIVE" | "LOCKED" | "STALE" | "SUCCESS";
  x?: number;
  y?: number;
  z?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryRelationship {
  id: string;
  source: string;
  target: string;
  type: "ORBIT" | "CONNECTOR" | "PARTICLE_FLOW";
  intensity: number;
}

/**
 * Memory API Client (Logic Scaffold for Mempalace)
 */
const MEMORY_API_URL =
  typeof window === "undefined"
    ? serviceConfig.openMemoryUrl || "http://localhost:4005"
    : "";

const client = createClient({
  baseUrl: MEMORY_API_URL,
});

export const memoryApi = {
  /**
   * Get cluster-wide memory health and metrics
   */
  getOverview: () => client.get<MemoryOverview>("/api/memory/overview"),

  /**
   * Get holographic graph data (Nodes + Relationships)
   */
  getGraph: () =>
    client.get<{ nodes: MemoryNode[]; links: MemoryRelationship[] }>(
      "/api/memory/graph"
    ),

  /**
   * Search for specific memories
   */
  searchMemories: (query: string) =>
    client.get<{ results: unknown[] }>(
      `/api/memory/search?q=${encodeURIComponent(query)}`
    ),

  /**
   * Action: Rebuild the holographic memory graph
   */
  rebuildGraph: () => client.post("/api/memory/actions/rebuild"),

  /**
   * Action: Merge duplicate memory clusters
   */
  mergeDuplicates: () => client.post("/api/memory/actions/merge"),
};
