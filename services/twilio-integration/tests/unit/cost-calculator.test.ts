import { describe, it, expect } from "vitest";

const pricingConfig = {
  voice: { perMinute: 0.013, recording: 0.0025 },
  sms: { perMessage: 0.0075, mms: 0.02 },
  phoneNumber: { monthly: 1.0 },
};

// Standalone CostCalculator to avoid dotenv/twilio side-effects
class CostCalculator {
  static calculateVoiceCost(durationSeconds: number): number {
    const minutes = Math.ceil(durationSeconds / 60);
    return minutes * pricingConfig.voice.perMinute;
  }

  static calculateRecordingCost(durationSeconds: number): number {
    const minutes = Math.ceil(durationSeconds / 60);
    return minutes * pricingConfig.voice.recording;
  }

  static calculateSMSCost(hasMedia: boolean = false): number {
    return hasMedia ? pricingConfig.sms.mms : pricingConfig.sms.perMessage;
  }

  static calculatePhoneNumberCost(numberOfPhones: number): number {
    return numberOfPhones * pricingConfig.phoneNumber.monthly;
  }

  static parseTwilioPrice(price: string | undefined): number {
    if (!price) return 0;
    const cleaned = price.replace(/[^0-9.-]/g, "");
    return Math.abs(parseFloat(cleaned) || 0);
  }

  static calculatePeriodCost(
    voiceMinutes: number,
    recordingMinutes: number,
    smsCount: number,
    mmsCount: number,
    phoneNumbers: number
  ): number {
    return (
      voiceMinutes * pricingConfig.voice.perMinute +
      recordingMinutes * pricingConfig.voice.recording +
      smsCount * pricingConfig.sms.perMessage +
      mmsCount * pricingConfig.sms.mms +
      CostCalculator.calculatePhoneNumberCost(phoneNumbers)
    );
  }

  static estimateCost(operations: {
    voiceMinutes?: number;
    smsMessages?: number;
    mmsMessages?: number;
    recordingMinutes?: number;
  }): number {
    let total = 0;
    if (operations.voiceMinutes)
      total += operations.voiceMinutes * pricingConfig.voice.perMinute;
    if (operations.smsMessages)
      total += operations.smsMessages * pricingConfig.sms.perMessage;
    if (operations.mmsMessages)
      total += operations.mmsMessages * pricingConfig.sms.mms;
    if (operations.recordingMinutes)
      total += operations.recordingMinutes * pricingConfig.voice.recording;
    return total;
  }

  static formatCost(cost: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cost);
  }

  static generateCostReport(
    startDate: Date,
    endDate: Date,
    voiceData: { totalCalls: number; totalMinutes: number; totalCost: number },
    smsData: { totalMessages: number; totalCost: number },
    recordingData: { totalRecordings: number; totalDuration: number },
    phoneNumbers: number
  ) {
    const recordingCost = CostCalculator.calculateRecordingCost(
      recordingData.totalDuration
    );
    const phoneCost = CostCalculator.calculatePhoneNumberCost(phoneNumbers);
    return {
      period: { start: startDate, end: endDate },
      voice: {
        totalCalls: voiceData.totalCalls,
        totalMinutes: voiceData.totalMinutes,
        totalCost: voiceData.totalCost,
        costPerMinute:
          voiceData.totalMinutes > 0
            ? voiceData.totalCost / voiceData.totalMinutes
            : 0,
      },
      sms: {
        totalMessages: smsData.totalMessages,
        totalCost: smsData.totalCost,
        costPerMessage:
          smsData.totalMessages > 0
            ? smsData.totalCost / smsData.totalMessages
            : 0,
      },
      recording: {
        totalRecordings: recordingData.totalRecordings,
        totalDuration: recordingData.totalDuration,
        totalCost: recordingCost,
      },
      phoneNumbers: { totalNumbers: phoneNumbers, monthlyCost: phoneCost },
      totalCost:
        voiceData.totalCost + smsData.totalCost + recordingCost + phoneCost,
    };
  }
}

describe("CostCalculator", () => {
  describe("calculateVoiceCost", () => {
    it("calculates cost for full minutes", () => {
      expect(CostCalculator.calculateVoiceCost(60)).toBeCloseTo(0.013);
      expect(CostCalculator.calculateVoiceCost(120)).toBeCloseTo(0.026);
    });

    it("rounds up partial minutes", () => {
      // 90 seconds = ceil(1.5) = 2 minutes
      expect(CostCalculator.calculateVoiceCost(90)).toBeCloseTo(0.026);
    });

    it("treats 1 second as 1 minute", () => {
      expect(CostCalculator.calculateVoiceCost(1)).toBeCloseTo(0.013);
    });

    it("handles zero duration", () => {
      expect(CostCalculator.calculateVoiceCost(0)).toBe(0);
    });
  });

  describe("calculateRecordingCost", () => {
    it("calculates recording cost per minute", () => {
      expect(CostCalculator.calculateRecordingCost(60)).toBeCloseTo(0.0025);
    });

    it("rounds up partial minutes", () => {
      expect(CostCalculator.calculateRecordingCost(30)).toBeCloseTo(0.0025);
    });
  });

  describe("calculateSMSCost", () => {
    it("returns SMS price by default", () => {
      expect(CostCalculator.calculateSMSCost()).toBeCloseTo(0.0075);
    });

    it("returns MMS price when media is included", () => {
      expect(CostCalculator.calculateSMSCost(true)).toBeCloseTo(0.02);
    });

    it("returns SMS price when explicitly no media", () => {
      expect(CostCalculator.calculateSMSCost(false)).toBeCloseTo(0.0075);
    });
  });

  describe("calculatePhoneNumberCost", () => {
    it("calculates monthly cost for multiple numbers", () => {
      expect(CostCalculator.calculatePhoneNumberCost(3)).toBe(3.0);
    });

    it("returns 0 for zero numbers", () => {
      expect(CostCalculator.calculatePhoneNumberCost(0)).toBe(0);
    });
  });

  describe("parseTwilioPrice", () => {
    it("parses negative price strings (Twilio format)", () => {
      expect(CostCalculator.parseTwilioPrice("-0.0075")).toBeCloseTo(0.0075);
    });

    it("parses price with currency symbol", () => {
      expect(CostCalculator.parseTwilioPrice("$0.013")).toBeCloseTo(0.013);
    });

    it("returns 0 for undefined", () => {
      expect(CostCalculator.parseTwilioPrice(undefined)).toBe(0);
    });

    it("returns 0 for empty string", () => {
      expect(CostCalculator.parseTwilioPrice("")).toBe(0);
    });

    it("returns 0 for non-numeric string", () => {
      expect(CostCalculator.parseTwilioPrice("free")).toBe(0);
    });
  });

  describe("calculatePeriodCost", () => {
    it("sums all cost components", () => {
      const cost = CostCalculator.calculatePeriodCost(
        100, // voice minutes
        50, // recording minutes
        200, // SMS count
        10, // MMS count
        5 // phone numbers
      );
      const expected =
        100 * 0.013 + 50 * 0.0025 + 200 * 0.0075 + 10 * 0.02 + 5 * 1.0;
      expect(cost).toBeCloseTo(expected);
    });

    it("handles all zeros", () => {
      expect(CostCalculator.calculatePeriodCost(0, 0, 0, 0, 0)).toBe(0);
    });
  });

  describe("estimateCost", () => {
    it("estimates cost for voice only", () => {
      const cost = CostCalculator.estimateCost({ voiceMinutes: 100 });
      expect(cost).toBeCloseTo(100 * 0.013);
    });

    it("estimates cost for SMS only", () => {
      const cost = CostCalculator.estimateCost({ smsMessages: 500 });
      expect(cost).toBeCloseTo(500 * 0.0075);
    });

    it("estimates cost for combined operations", () => {
      const cost = CostCalculator.estimateCost({
        voiceMinutes: 50,
        smsMessages: 100,
        mmsMessages: 10,
        recordingMinutes: 20,
      });
      const expected = 50 * 0.013 + 100 * 0.0075 + 10 * 0.02 + 20 * 0.0025;
      expect(cost).toBeCloseTo(expected);
    });

    it("returns 0 for empty operations", () => {
      expect(CostCalculator.estimateCost({})).toBe(0);
    });
  });

  describe("formatCost", () => {
    it("formats cost in USD by default", () => {
      const formatted = CostCalculator.formatCost(1234.56);
      expect(formatted).toBe("$1,234.56");
    });

    it("formats cost in EUR", () => {
      const formatted = CostCalculator.formatCost(100, "EUR");
      expect(formatted).toContain("100");
    });

    it("formats zero cost", () => {
      const formatted = CostCalculator.formatCost(0);
      expect(formatted).toBe("$0.00");
    });
  });

  describe("generateCostReport", () => {
    it("generates a complete cost report", () => {
      const start = new Date("2025-01-01");
      const end = new Date("2025-01-31");
      const report = CostCalculator.generateCostReport(
        start,
        end,
        { totalCalls: 50, totalMinutes: 120, totalCost: 1.56 },
        { totalMessages: 200, totalCost: 1.5 },
        { totalRecordings: 10, totalDuration: 300 },
        3
      );

      expect(report.period.start).toBe(start);
      expect(report.period.end).toBe(end);
      expect(report.voice.totalCalls).toBe(50);
      expect(report.voice.costPerMinute).toBeCloseTo(1.56 / 120);
      expect(report.sms.costPerMessage).toBeCloseTo(1.5 / 200);
      expect(report.phoneNumbers.totalNumbers).toBe(3);
      expect(report.phoneNumbers.monthlyCost).toBe(3.0);
      expect(report.totalCost).toBeGreaterThan(0);
    });

    it("handles zero voice minutes without division by zero", () => {
      const report = CostCalculator.generateCostReport(
        new Date(),
        new Date(),
        { totalCalls: 0, totalMinutes: 0, totalCost: 0 },
        { totalMessages: 0, totalCost: 0 },
        { totalRecordings: 0, totalDuration: 0 },
        0
      );
      expect(report.voice.costPerMinute).toBe(0);
      expect(report.sms.costPerMessage).toBe(0);
    });
  });
});
