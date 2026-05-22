import assert from "node:assert/strict";
import {
  isProductEventChannel,
  parseProductEvent,
  toSystemEvent,
} from "./productEvents";

const parsed = parseProductEvent({
  type: "lead:updates",
  source: "lead-ingestion",
  correlationId: "lead-123",
  traceId: "trace-123",
  state: "created",
  mode: "mock",
  data: {
    leadId: "lead-123",
    sourceLabel: "landing-page",
  },
});

assert.equal(parsed.type, "lead:updates");
assert.equal(parsed.source, "lead-ingestion");
assert.equal(parsed.correlationId, "lead-123");
assert.equal(parsed.state, "created");
assert.equal(parsed.mode, "mock");
assert.ok(parsed.timestamp);
assert.equal(isProductEventChannel("quote:viewed"), true);
assert.equal(isProductEventChannel("unknown:event"), false);

const systemEvent = toSystemEvent(parsed);
assert.deepEqual(systemEvent, {
  type: "lead:updates",
  source: "lead-ingestion",
  timestamp: parsed.timestamp,
  correlationId: "lead-123",
  traceId: "trace-123",
  state: "created",
  mode: "mock",
  data: {
    leadId: "lead-123",
    sourceLabel: "landing-page",
  },
});

assert.throws(() => {
  parseProductEvent({
    type: "lead:updates",
    source: "lead-ingestion",
    correlationId: "",
    state: "created",
  });
});
