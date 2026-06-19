export const campaignStates = [
  "draft",
  "active",
  "paused",
  "stopped",
  "completed",
] as const;
export type CampaignState = (typeof campaignStates)[number];
