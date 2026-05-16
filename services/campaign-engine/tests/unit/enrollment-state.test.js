import { jest } from "@jest/globals";
import { CampaignExecution } from "../../src/models/campaign-execution.model.js";
import { CampaignService } from "../../src/services/campaign.service.js";

describe("Campaign enrollment state transitions", () => {
  it("marks STOP as terminal and prevents resume", async () => {
    const service = new CampaignService();
    service.scheduler.cancelExecution = jest.fn();

    const execution = new CampaignExecution({
      id: "exec_stop",
      campaignId: "campaign_123",
      contactId: "contact_123",
      status: "active",
      steps: [],
    });
    service.executions.set(execution.id, execution);

    const stopped = await service.handleComplianceStop(
      execution.id,
      "STOP_DETECTED"
    );
    expect(stopped.success).toBe(true);
    expect(stopped.execution.status).toBe("stopped");
    expect(stopped.execution.metadata.stopReason).toBe("STOP_DETECTED");

    const resumed = await service.resumeExecution(execution.id);
    expect(resumed.success).toBe(false);
    expect(resumed.error).toContain("terminal");
  });

  it("pauses active automation on borrower reply", async () => {
    const service = new CampaignService();
    service.scheduler.pauseExecution = jest.fn();

    const execution = new CampaignExecution({
      id: "exec_reply",
      campaignId: "campaign_123",
      contactId: "contact_123",
      status: "active",
      steps: [],
    });
    service.executions.set(execution.id, execution);

    const replied = await service.handleInboundReply(execution.id, {
      channel: "sms",
      body: "Can you call me tomorrow?",
    });

    expect(replied.success).toBe(true);
    expect(replied.execution.status).toBe("replied");
    expect(replied.execution.metadata.pauseReason).toBe("borrower_reply");
  });
});
