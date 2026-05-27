import {
  applications,
  crmOverview,
  leads,
  recentActivity as communicationLogs,
} from "./mock-data";

export type WorkspaceData = {
  leads: typeof leads;
  applications: typeof applications;
  crmOverview: typeof crmOverview;
  recentActivity: string[];
  source: string;
};

export async function getCrmWorkspaceData(): Promise<WorkspaceData> {
  return {
    leads,
    applications,
    crmOverview,
    recentActivity: communicationLogs.map((log) => log.content_preview),
    source: "mock",
  };
}
