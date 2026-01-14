import { pricingConfig } from '../config/twilio.config';
import { CostTracking } from '../types/twilio.types';

export class CostCalculator {
  /**
   * Calculate voice call cost based on duration
   */
  static calculateVoiceCost(durationSeconds: number): number {
    const minutes = Math.ceil(durationSeconds / 60);
    return minutes * pricingConfig.voice.perMinute;
  }

  /**
   * Calculate recording cost based on duration
   */
  static calculateRecordingCost(durationSeconds: number): number {
    const minutes = Math.ceil(durationSeconds / 60);
    return minutes * pricingConfig.voice.recording;
  }

  /**
   * Calculate SMS cost
   */
  static calculateSMSCost(hasMedia: boolean = false): number {
    return hasMedia ? pricingConfig.sms.mms : pricingConfig.sms.perMessage;
  }

  /**
   * Calculate monthly phone number cost
   */
  static calculatePhoneNumberCost(numberOfPhones: number): number {
    return numberOfPhones * pricingConfig.phoneNumber.monthly;
  }

  /**
   * Parse Twilio price string to number
   */
  static parseTwilioPrice(price: string | undefined): number {
    if (!price) return 0;
    // Remove currency symbol and parse
    const cleaned = price.replace(/[^0-9.-]/g, '');
    return Math.abs(parseFloat(cleaned) || 0);
  }

  /**
   * Calculate total cost for a period
   */
  static calculatePeriodCost(
    voiceMinutes: number,
    recordingMinutes: number,
    smsCount: number,
    mmsCount: number,
    phoneNumbers: number
  ): number {
    const voiceCost = (voiceMinutes * pricingConfig.voice.perMinute);
    const recordingCost = (recordingMinutes * pricingConfig.voice.recording);
    const smsCost = (smsCount * pricingConfig.sms.perMessage);
    const mmsCost = (mmsCount * pricingConfig.sms.mms);
    const phoneCost = this.calculatePhoneNumberCost(phoneNumbers);

    return voiceCost + recordingCost + smsCost + mmsCost + phoneCost;
  }

  /**
   * Generate cost report for a period
   */
  static generateCostReport(
    startDate: Date,
    endDate: Date,
    voiceData: { totalCalls: number; totalMinutes: number; totalCost: number },
    smsData: { totalMessages: number; totalCost: number },
    recordingData: { totalRecordings: number; totalDuration: number },
    phoneNumbers: number
  ): CostTracking {
    const recordingCost = this.calculateRecordingCost(recordingData.totalDuration);
    const phoneCost = this.calculatePhoneNumberCost(phoneNumbers);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      voice: {
        totalCalls: voiceData.totalCalls,
        totalMinutes: voiceData.totalMinutes,
        totalCost: voiceData.totalCost,
        costPerMinute: voiceData.totalMinutes > 0
          ? voiceData.totalCost / voiceData.totalMinutes
          : 0,
      },
      sms: {
        totalMessages: smsData.totalMessages,
        totalCost: smsData.totalCost,
        costPerMessage: smsData.totalMessages > 0
          ? smsData.totalCost / smsData.totalMessages
          : 0,
      },
      recording: {
        totalRecordings: recordingData.totalRecordings,
        totalDuration: recordingData.totalDuration,
        totalCost: recordingCost,
      },
      phoneNumbers: {
        totalNumbers: phoneNumbers,
        monthlyCost: phoneCost,
      },
      totalCost: voiceData.totalCost + smsData.totalCost + recordingCost + phoneCost,
    };
  }

  /**
   * Estimate cost for planned operations
   */
  static estimateCost(operations: {
    voiceMinutes?: number;
    smsMessages?: number;
    mmsMessages?: number;
    recordingMinutes?: number;
  }): number {
    let total = 0;

    if (operations.voiceMinutes) {
      total += operations.voiceMinutes * pricingConfig.voice.perMinute;
    }

    if (operations.smsMessages) {
      total += operations.smsMessages * pricingConfig.sms.perMessage;
    }

    if (operations.mmsMessages) {
      total += operations.mmsMessages * pricingConfig.sms.mms;
    }

    if (operations.recordingMinutes) {
      total += operations.recordingMinutes * pricingConfig.voice.recording;
    }

    return total;
  }

  /**
   * Format cost as currency string
   */
  static formatCost(cost: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cost);
  }
}
