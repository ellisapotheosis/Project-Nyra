import { describe, it, expect } from "vitest";
import {
  isStopRequest,
  isUnsubscribeRequest,
} from "../../../packages/domain-models/src/compliance";

describe("TCPA Sentinel: Keyword Gating", () => {
  const stopKeywords = [
    "STOP",
    "STOP ALL",
    "UNSUBSCRIBE",
    "QUIT",
    "CANCEL",
    "END",
    "OPT OUT",
    "DNC",
  ];

  const neutralKeywords = [
    "HELLO",
    "I HAVE A QUESTION",
    "SEND MORE INFO",
    "YES PLEASE",
  ];

  it("should detect explicit STOP keywords", () => {
    stopKeywords.forEach((kw) => {
      expect(isStopRequest(kw)).toBe(true);
      expect(isStopRequest(`Please ${kw} now`)).toBe(true);
    });
  });

  it("should NOT detect neutral keywords as stop requests", () => {
    neutralKeywords.forEach((kw) => {
      expect(isStopRequest(kw)).toBe(false);
    });
  });

  it("should handle case-insensitivity and whitespace", () => {
    expect(isStopRequest(" stop ")).toBe(true);
    expect(isStopRequest("UnSuBsCrIbE")).toBe(true);
    expect(isStopRequest("opt-out")).toBe(false); // Schema specifically checks for \b boundaries or specific regex
    expect(isStopRequest("opt out")).toBe(true);
  });
});
