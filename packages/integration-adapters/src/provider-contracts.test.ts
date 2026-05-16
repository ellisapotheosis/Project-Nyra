import { describe, expect, it } from "vitest";

import {
  MockGoogleWorkspaceClient,
  MockNerveClient,
  MockOpenClawClient,
} from "./index";

describe("provider-specific adapter contracts", () => {
  it("creates Google Workspace calendar events and email drafts deterministically", async () => {
    const workspace = new MockGoogleWorkspaceClient();

    const event = await workspace.createCalendarEvent({
      title: "Borrower quote review",
      startsAt: "2026-05-12T17:00:00.000Z",
      endsAt: "2026-05-12T17:30:00.000Z",
      attendeeEmails: ["borrower@example.com"],
      leadId: "lead-123",
    });
    const draft = await workspace.createEmailDraft({
      to: "borrower@example.com",
      subject: "Your quote review",
      body: "Draft only. Broker approval required before sending.",
      leadId: "lead-123",
    });

    expect(event.id).toBe("mock-gcal-1");
    expect(draft.id).toBe("mock-gmail-1");
    expect((await workspace.checkHealth()).status).toBe("HEALTHY");
  });

  it("keeps OpenClaw risky actions in proposed-action approval state", async () => {
    const openClaw = new MockOpenClawClient();
    const { sessionId } = await openClaw.launchSession("lead-123");

    const proposal = await openClaw.proposeAction({
      sessionId,
      leadId: "lead-123",
      summary: "Send borrower quote terms",
      risk: "HIGH",
    });
    const approval = await openClaw.requestApproval("send quote to borrower");

    expect(proposal.requiresApproval).toBe(true);
    expect(approval.approved).toBe(false);
  });

  it("keeps Nerve voice settings private to worker dashboards", async () => {
    const nerve = new MockNerveClient();

    await nerve.updateVoiceSettings("worker-rtx5090", {
      voice: "broker-review",
      locale: "en-US",
      maxCallSeconds: 900,
      requireBrokerApproval: true,
    });

    expect(nerve.getDashboardUrl("worker-rtx5090")).toBe(
      "http://worker-rtx5090.trex-fiordland.ts.net:18789"
    );
    expect(nerve.settings.get("worker-rtx5090")?.requireBrokerApproval).toBe(true);
  });
});
