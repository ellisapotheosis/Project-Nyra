import { describe, expect, it } from "vitest";
import {
  buildCommunicationLog,
  buildSuppressionRecord,
  createOutboundMessage,
  normalizeInboundMessage,
  normalizeSendGridEventWebhook,
  normalizeTwilioInboundWebhook,
  renderTemplate,
} from "./index";

const lead = {
  id: "lead_123",
  firstName: "Ada",
  lastName: "Borrower",
  email: "ada@example.com",
  phone: "15550001111",
  source: "ratehunter",
  consentStatus: "OPTED_IN" as const,
  consentSms: "OPTED_IN" as const,
};

describe("communication service core", () => {
  it("requires compliance allow decision before queueing outbound messages", () => {
    const message = createOutboundMessage({
      lead,
      channel: "SMS",
      body: "Your broker will follow up shortly.",
      now: new Date("2026-05-11T18:00:00.000Z"),
    });

    expect(message.status).toBe("QUEUED");
    expect(message.complianceDecision?.allowed).toBe(true);
  });

  it("blocks outbound messages when compliance fails", () => {
    expect(() =>
      createOutboundMessage({
        lead: { ...lead, doNotContact: true },
        channel: "SMS",
        body: "Can we talk?",
        now: new Date("2026-05-11T18:00:00.000Z"),
      })
    ).toThrow("COMPLIANCE_BLOCKED:DO_NOT_CONTACT");
  });

  it("normalizes STOP replies into campaign stop directives", () => {
    const normalized = normalizeInboundMessage({
      leadId: "lead_123",
      channel: "SMS",
      body: "stop",
      provider: "twilio",
      providerMessageId: "SM123",
      receivedAt: "2026-05-11T18:00:00.000Z",
    });

    expect(normalized.campaignDirective).toBe("STOP");
    expect(normalized.complianceEvent?.eventType).toBe("STOP_DETECTED");
  });

  it("fails templates when required merge variables are missing", () => {
    expect(() =>
      renderTemplate({
        template: {
          id: "tmpl_new_lead_sms_1",
          channel: "SMS",
          body: "Hi {{firstName}}, {{broker.name}} can help with {{loanGoal}}.",
          requiredVariables: ["firstName", "broker.name", "loanGoal"],
        },
        variables: {
          firstName: "Ada",
          broker: { name: "Ellis" },
        },
      })
    ).toThrow("TEMPLATE_MISSING_VARIABLES:loanGoal");
  });

  it("normalizes borrower SMS replies into unified inbox reply-pause events", () => {
    const event = normalizeTwilioInboundWebhook({
      MessageSid: "SM123",
      From: "+15550001111",
      To: "+15550002222",
      Body: "Can you call tomorrow?",
      leadId: "lead_123",
      campaignEnrollmentId: "enroll_123",
      receivedAt: "2026-05-11T18:00:00.000Z",
    });

    expect(event.idempotencyKey).toBe("twilio:sms:SM123");
    expect(event.eventType).toBe("MESSAGE_RECEIVED");
    expect(event.campaignDirective).toBe("REPLY_PAUSE");
    expect(buildCommunicationLog(event)?.status).toBe("MESSAGE_RECEIVED");
  });

  it("normalizes Twilio STOP replies into suppression records", () => {
    const event = normalizeTwilioInboundWebhook({
      MessageSid: "SM_STOP",
      From: "+15550001111",
      To: "+15550002222",
      Body: "STOP",
      leadId: "lead_123",
      receivedAt: "2026-05-11T18:00:00.000Z",
    });

    expect(event.campaignDirective).toBe("STOP");
    expect(buildSuppressionRecord(event)).toMatchObject({
      leadId: "lead_123",
      channel: "SMS",
      reason: "STOP",
      source: "twilio",
    });
  });

  it("normalizes SendGrid unsubscribes and bounces into safe directives", () => {
    const unsubscribe = normalizeSendGridEventWebhook({
      event: "unsubscribe",
      email: "ada@example.com",
      timestamp: 1778522400,
      sg_event_id: "sg_unsub_123",
      custom_args: {
        leadId: "lead_123",
        campaignEnrollmentId: "enroll_123",
        templateId: "tmpl_email_1",
      },
    });
    const bounce = normalizeSendGridEventWebhook({
      event: "bounce",
      email: "ada@example.com",
      timestamp: 1778522400,
      sg_event_id: "sg_bounce_123",
      custom_args: {
        leadId: "lead_123",
      },
    });

    expect(unsubscribe.campaignDirective).toBe("UNSUBSCRIBE");
    expect(buildSuppressionRecord(unsubscribe)?.reason).toBe("UNSUBSCRIBE");
    expect(bounce.campaignDirective).toBe("BOUNCE_SUPPRESSION");
    expect(buildSuppressionRecord(bounce)?.reason).toBe("BOUNCE");
  });
});
