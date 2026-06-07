import { describe, expect, it } from "vitest";
import {
  DiscordAlertService,
  createDiscordAlertRestHandler,
  redactDiscordAlertText,
  toDiscordWebhookPayload,
  type DiscordAlertInput,
  type DiscordWebhookClient,
} from "./index";

const fixedDate = new Date("2026-05-20T20:00:00.000Z");

const baseAlert: DiscordAlertInput = {
  type: "hot_lead",
  severity: "critical",
  title: "Hot lead replied ready",
  body: "Borrower asked for a call now",
  source: "campaign-reply-router",
  correlationId: "trace-123",
  traceId: "tool-456",
  leadId: "lead-123",
};

describe("discord-alerts service", () => {
  it("sends validated operator alerts through the webhook boundary", async () => {
    const sent: unknown[] = [];
    const webhookClient: DiscordWebhookClient = {
      async send(alert) {
        sent.push(toDiscordWebhookPayload(alert));
        return { providerMessageId: "bucket-123" };
      },
    };
    const service = new DiscordAlertService({
      webhookClient,
      now: () => fixedDate,
      idFactory: () => "alert-123",
    });

    const result = await service.sendAlert(baseAlert);

    expect(result.record.status).toBe("SENT");
    expect(result.record.providerMessageId).toBe("bucket-123");
    expect(result.auditEvent).toMatchObject({
      type: "operator_alert.discord",
      alertId: "alert-123",
      status: "SENT",
      correlationId: "trace-123",
    });
    expect(sent).toHaveLength(1);
  });

  it("dedupes repeated alerts inside the throttle window", async () => {
    let calls = 0;
    const service = new DiscordAlertService({
      webhookClient: {
        async send() {
          calls += 1;
          return {};
        },
      },
      now: () => fixedDate,
      idFactory: (() => {
        let i = 0;
        return () => `alert-${++i}`;
      })(),
      defaultThrottleWindowSeconds: 300,
    });

    const first = await service.sendAlert(baseAlert);
    const second = await service.sendAlert(baseAlert);

    expect(first.record.status).toBe("SENT");
    expect(second.record.status).toBe("THROTTLED");
    expect(second.record.reason).toBe("duplicate_in_window");
    expect(calls).toBe(1);
  });

  it("redacts obvious PII before audit or provider send", () => {
    expect(
      redactDiscordAlertText(
        "Call 555-111-2222, email a@example.com, ssn 123-45-6789"
      )
    ).toBe("Call [REDACTED_PHONE], email [REDACTED_EMAIL], ssn [REDACTED_SSN]");
  });

  it("stays disabled when no webhook client is configured", async () => {
    const service = new DiscordAlertService({
      now: () => fixedDate,
      idFactory: () => "alert-disabled",
    });

    const result = await service.sendAlert(baseAlert);

    expect(result.record.status).toBe("DISABLED");
    expect(result.record.reason).toBe("webhook_not_configured");
  });

  it("exposes REST-compatible send and status handlers", async () => {
    const service = new DiscordAlertService({
      webhookClient: {
        async send() {
          return {};
        },
      },
      now: () => fixedDate,
      idFactory: () => "alert-rest",
    });
    const handler = createDiscordAlertRestHandler(service);

    const createResponse = await handler({
      method: "POST",
      path: "/alerts/discord",
      body: baseAlert,
    });
    const statusResponse = await handler({
      method: "GET",
      path: "/alerts/discord/alert-rest/status",
    });

    expect(createResponse.status).toBe(202);
    expect(statusResponse.status).toBe(200);
  });
});
