import { NextResponse } from "next/server";
import { serviceConfig } from "@/lib/api/config";

const CRM_API_URL = serviceConfig.crmApiUrl;
const CRM_API_KEY = serviceConfig.crmApiKey;

export async function GET() {
  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/memory/graph`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (e) {
      console.error("[Memory API] Graph fetch failed, using fallback mock.");
    }
  }

  // Fallback Mock Data with Sacred Geometry
  return NextResponse.json({
    nodes: [
      { id: 'l1', label: 'Sarah Johnson', type: 'LEAD', geometry: 'CUBE', color: 'indigo-500', x: 200, y: 150 },
      { id: 'l2', label: 'Michael Chen', type: 'LEAD', geometry: 'TETRAHEDRON', color: 'pink-500', x: 600, y: 150 },
      { id: 'c1', label: 'Refi_Blitz_V2', type: 'CAMPAIGN', geometry: 'DODECAHEDRON', color: 'indigo-600', x: 400, y: 400 },
      { id: 'a1', label: 'Nyra_Orch', type: 'AGENT', geometry: 'ICOSAHEDRON', color: 'turquoise-400', x: 400, y: 250 },
      { id: 's1', label: 'Cluster_5090', type: 'SYSTEM', geometry: 'OCTAHEDRON', color: 'indigo-400', x: 200, y: 400 }
    ],
    links: [
      { id: 'r1', source: 'l1', target: 'c1', type: 'ORBIT', intensity: 0.8 },
      { id: 'r2', source: 'a1', target: 'l1', type: 'CONNECTOR', intensity: 0.95 },
      { id: 'r3', source: 'a1', target: 'l2', type: 'CONNECTOR', intensity: 0.7 },
      { id: 'r4', source: 's1', target: 'a1', type: 'PARTICLE_FLOW', intensity: 1.0 }
    ],
    source: "mock"
  });
}
