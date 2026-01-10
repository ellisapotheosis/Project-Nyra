import twilio from 'twilio';
import { twilioConfig } from '../config/twilio.config';
import { VoiceCallParams, VoiceCallResponse, TwilioClient } from '../types/twilio.types';
import { normalizePhoneNumber } from '../utils/validation';
import { CallModel } from '../models/call.model';

export class VoiceService {
  private client: TwilioClient;
  private defaultFrom: string;

  constructor() {
    this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    this.defaultFrom = twilioConfig.phoneNumber;
  }

  /**
   * Initiate outbound call
   */
  async initiateCall(params: Omit<VoiceCallParams, 'from'> & { from?: string }): Promise<VoiceCallResponse> {
    try {
      const normalizedTo = normalizePhoneNumber(params.to);
      const from = params.from || this.defaultFrom;

      const call = await this.client.calls.create({
        to: normalizedTo,
        from,
        url: params.url,
        method: params.method || 'POST',
        statusCallback: params.statusCallback,
        statusCallbackMethod: params.statusCallbackMethod || 'POST',
        timeout: params.timeout || 60,
        record: params.record || false,
        recordingStatusCallback: params.recordingStatusCallback,
      });

      // Store call in database
      await CallModel.create({
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        direction: call.direction,
        dateCreated: call.dateCreated,
      });

      return {
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        direction: call.direction,
        dateCreated: call.dateCreated,
      };
    } catch (error: any) {
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }

  /**
   * Get call status and details
   */
  async getCallStatus(callSid: string): Promise<VoiceCallResponse> {
    try {
      const call = await this.client.calls(callSid).fetch();

      // Update database
      await CallModel.findOneAndUpdate(
        { sid: callSid },
        {
          status: call.status,
          duration: call.duration,
          price: call.price || undefined,
          priceUnit: call.priceUnit || undefined,
          endedAt: call.endTime,
        },
        { new: true, upsert: true }
      );

      return {
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        direction: call.direction,
        dateCreated: call.dateCreated,
        duration: call.duration || undefined,
        price: call.price || undefined,
        priceUnit: call.priceUnit || undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch call status: ${error.message}`);
    }
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<{ status: string; message: string }> {
    try {
      await this.client.calls(callSid).update({ status: 'completed' });

      await CallModel.findOneAndUpdate(
        { sid: callSid },
        { status: 'completed', endedAt: new Date() }
      );

      return {
        status: 'completed',
        message: 'Call ended successfully',
      };
    } catch (error: any) {
      throw new Error(`Failed to end call: ${error.message}`);
    }
  }

  /**
   * Get call history
   */
  async getCallHistory(filters: {
    phoneNumber?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<VoiceCallResponse[]> {
    try {
      const query: any = {};

      if (filters.phoneNumber) {
        const normalized = normalizePhoneNumber(filters.phoneNumber);
        query.$or = [{ to: normalized }, { from: normalized }];
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        query.dateCreated = {};
        if (filters.startDate) query.dateCreated.$gte = filters.startDate;
        if (filters.endDate) query.dateCreated.$lte = filters.endDate;
      }

      const calls = await CallModel.find(query)
        .sort({ dateCreated: -1 })
        .limit(filters.limit || 50);

      return calls.map((call) => ({
        sid: call.sid,
        status: call.status,
        to: call.to,
        from: call.from,
        direction: call.direction,
        dateCreated: call.dateCreated,
        duration: call.duration,
        price: call.price,
        priceUnit: call.priceUnit,
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch call history: ${error.message}`);
    }
  }

  /**
   * Generate TwiML for call flow
   */
  generateTwiML(actions: Array<{
    action: 'say' | 'play' | 'gather' | 'dial' | 'record' | 'hangup';
    options: any;
  }>): string {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    for (const { action, options } of actions) {
      switch (action) {
        case 'say':
          twiml.say(options);
          break;
        case 'play':
          twiml.play(options);
          break;
        case 'gather':
          twiml.gather(options);
          break;
        case 'dial':
          twiml.dial(options);
          break;
        case 'record':
          twiml.record(options);
          break;
        case 'hangup':
          twiml.hangup();
          break;
      }
    }

    return twiml.toString();
  }

  /**
   * Make bulk calls
   */
  async makeBulkCalls(
    calls: Array<Omit<VoiceCallParams, 'from'>>
  ): Promise<VoiceCallResponse[]> {
    const results = await Promise.allSettled(
      calls.map((call) => this.initiateCall(call))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<VoiceCallResponse> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  /**
   * Update call with custom metadata
   */
  async updateCallMetadata(
    callSid: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await CallModel.findOneAndUpdate(
      { sid: callSid },
      { metadata },
      { new: true }
    );
  }
}
