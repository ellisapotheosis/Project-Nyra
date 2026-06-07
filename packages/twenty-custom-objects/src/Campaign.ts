// packages/twenty-custom-objects/src/Campaign.ts

export const CampaignDefinition = {
  nameSingular: "campaign",
  namePlural: "campaigns",
  labelSingular: "Campaign",
  labelPlural: "Campaigns",
  description: "Multi-channel drip campaign with scheduling",
  icon: "IconSend",

  fields: [
    { name: "name", type: "TEXT", label: "Campaign Name", required: true },
    { name: "description", type: "TEXT", label: "Description" },
    { name: "active", type: "BOOLEAN", label: "Active", default: true },
    {
      name: "status",
      type: "SELECT",
      label: "Status",
      options: ["Draft", "Active", "Paused", "Stopped", "Archived"],
    },

    {
      name: "loanPurpose",
      type: "SELECT",
      label: "Target Loan Purpose",
      options: [
        "Purchase",
        "Refinance",
        "CashOut",
        "HELOC",
        "HELOAN",
        "Commercial",
        "HardMoney",
        "All",
      ],
    },

    {
      name: "durationDays",
      type: "NUMBER",
      label: "Duration (Days)",
      default: 45,
    },
    {
      name: "maxAttemptsPerDay",
      type: "NUMBER",
      label: "Max Attempts/Day",
      default: 3,
    },

    // Quiet hours
    {
      name: "quietHoursStart",
      type: "TEXT",
      label: "Quiet Hours Start",
      default: "20:00",
    },
    {
      name: "quietHoursEnd",
      type: "TEXT",
      label: "Quiet Hours End",
      default: "09:00",
    },
    {
      name: "timezone",
      type: "TEXT",
      label: "Timezone",
      default: "America/Los_Angeles",
    },

    // Days active
    {
      name: "workWeekdays",
      type: "BOOLEAN",
      label: "Run Weekdays",
      default: true,
    },
    {
      name: "workWeekends",
      type: "BOOLEAN",
      label: "Run Weekends",
      default: false,
    },

    // Steps stored as JSON
    { name: "stepsJson", type: "RAW_JSON", label: "Campaign Steps" },

    // Stats
    { name: "totalLeads", type: "NUMBER", label: "Total Leads", default: 0 },
    { name: "activeLeads", type: "NUMBER", label: "Active Leads", default: 0 },
    {
      name: "convertedLeads",
      type: "NUMBER",
      label: "Converted Leads",
      default: 0,
    },
    { name: "optedOutLeads", type: "NUMBER", label: "Opted Out", default: 0 },
    { name: "suppressionReason", type: "TEXT", label: "Suppression Reason" },
  ],

  relations: [
    { name: "leads", type: "ONE_TO_MANY", target: "mortgageLead" },
    { name: "steps", type: "ONE_TO_MANY", target: "campaignStep" },
    { name: "templates", type: "MANY_TO_MANY", target: "template" },
  ],
};
