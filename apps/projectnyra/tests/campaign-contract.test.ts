import { toCampaignContract } from "../src/lib/campaign-contract";

describe("campaign contract adapter", () => {
  it("normalizes builder steps into campaign-domain execution steps", () => {
    expect(
      toCampaignContract({
        name: "Purchase Nurture",
        loanPurpose: "PURCHASE",
        steps: [
          {
            id: "step-1",
            day: 1,
            channel: "email",
            templateId: "intro-email",
          },
          {
            id: "step-2",
            channel: "missed_call_ping",
            offsetMinutes: 90,
            templateId: "call-ping",
          },
        ],
      })
    ).toMatchObject({
      loanPurpose: "PURCHASE",
      steps: [
        {
          id: "step-1",
          channel: "EMAIL",
          delayMinutes: 1440,
          templateId: "intro-email",
          requiresApproval: false,
        },
        {
          id: "step-2",
          channel: "SMS",
          delayMinutes: 90,
          templateId: "call-ping",
          requiresApproval: true,
        },
      ],
    });
  });
});

export {};
