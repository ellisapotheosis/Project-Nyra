import { describe, expect, it } from "vitest";
import {
  normalizeRadarEvent,
  parseRadarMessage,
  toRadarLead,
} from "../../../apps/projectnyra/src/lib/leadRadarEvents";

describe("lead radar event mapping", () => {
  it("maps websocket product events into operator radar cards", () => {
    const event = normalizeRadarEvent({
      type: "hotlead:alerts",
      source: "lead-ingestion",
      timestamp: "2026-05-22T15:00:00.000Z",
      correlationId: "corr-123",
      traceId: "trace-123",
      state: "ready",
      mode: "live",
      data: {
        leadId: "lead-123",
        borrowerName: "Casey Borrower",
        sourceLabel: "ratehunter-form",
      },
    });

    expect(event).not.toBeNull();
    const lead = toRadarLead(event!);

    expect(lead).toMatchObject({
      id: "lead-123",
      name: "Casey Borrower",
      action: "Hot lead: Ready",
      intensity: 96,
      source: "ratehunter-form",
      traceId: "trace-123",
      mode: "live",
    });
  });

  it("parses hub messages and rejects non-event messages", () => {
    expect(
      parseRadarMessage(
        JSON.stringify({
          type: "event",
          payload: {
            type: "quote:viewed",
            source: "quote-service",
            timestamp: "2026-05-22T15:00:00.000Z",
            correlationId: "quote-123",
            state: "viewed",
            data: {
              quoteId: "quote-123",
              leadName: "Jordan Lead",
            },
          },
        })
      )
    ).toMatchObject({
      type: "quote:viewed",
      correlationId: "quote-123",
    });

    expect(parseRadarMessage(JSON.stringify({ type: "pong" }))).toBeNull();
    expect(parseRadarMessage("not-json")).toBeNull();
  });
});
