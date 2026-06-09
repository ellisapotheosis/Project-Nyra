import type { WorkspaceData } from "@/lib/crm-data";

export type CrmWorkspaceResponse = {
  workspace: WorkspaceData;
  source: WorkspaceData["source"];
  generatedAt: string;
};

export async function getCrmWorkspaceSnapshot(): Promise<CrmWorkspaceResponse> {
  const response = await fetch("/api/crm", {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string;
      error?: string;
    } | null;

    throw new Error(
      payload?.detail || payload?.error || "CRM workspace request failed"
    );
  }

  return response.json() as Promise<CrmWorkspaceResponse>;
}
