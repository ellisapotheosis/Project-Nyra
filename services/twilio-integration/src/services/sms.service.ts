import twilio from 'twilio';
import { twilioConfig } from '../config/twilio.config';
import { SMSMessage, SMSResponse, TwilioClient } from '../types/twilio.types';
import { normalizePhoneNumber } from '../utils/validation';
import { CostCalculator } from '../utils/cost-calculator';

export class SMSService {
  private client: TwilioClient;
  private defaultFrom: string;

  constructor() {
    this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    this.defaultFrom = twilioConfig.phoneNumber;
  }

  /**
   * Send SMS message
   */
  async sendSMS(message: Omit<SMSMessage, 'from'> & { from?: string }): Promise<SMSResponse> {
    try {
      const normalizedTo = normalizePhoneNumber(message.to);
      const from = message.from || this.defaultFrom;

      const twilioMessage = await this.client.messages.create({
        to: normalizedTo,
        from,
        body: message.body,
        mediaUrl: message.mediaUrl,
        statusCallback: message.statusCallback,
        messagingServiceSid: message.messagingServiceSid,
      });

      return {
        sid: twilioMessage.sid,
        status: twilioMessage.status,
        to: twilioMessage.to,
        from: twilioMessage.from,
        body: twilioMessage.body,
        dateCreated: twilioMessage.dateCreated,
        dateSent: twilioMessage.dateSent || undefined,
        errorCode: twilioMessage.errorCode || undefined,
        errorMessage: twilioMessage.errorMessage || undefined,
        price: twilioMessage.price || undefined,
        priceUnit: twilioMessage.priceUnit || undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(messages: Array<Omit<SMSMessage, 'from'>>): Promise<SMSResponse[]> {
    const results = await Promise.allSettled(
      messages.map((msg) => this.sendSMS(msg))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Return error response
        return {
          sid: '',
          status: 'failed',
          to: messages[index].to,
          from: this.defaultFrom,
          body: messages[index].body,
          dateCreated: new Date(),
          errorMessage: result.reason.message,
        } as SMSResponse;
      }
    });
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string): Promise<SMSResponse> {
    try {
      const message = await this.client.messages(messageSid).fetch();

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent || undefined,
        errorCode: message.errorCode || undefined,
        errorMessage: message.errorMessage || undefined,
        price: message.price || undefined,
        priceUnit: message.priceUnit || undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch message status: ${error.message}`);
    }
  }

  /**
   * Get message history for a phone number
   */
  async getMessageHistory(
    phoneNumber: string,
    limit: number = 50
  ): Promise<SMSResponse[]> {
    try {
      const normalizedNumber = normalizePhoneNumber(phoneNumber);

      const messages = await this.client.messages.list({
        to: normalizedNumber,
        limit,
      });

      const outboundMessages = await this.client.messages.list({
        from: normalizedNumber,
        limit,
      });

      const allMessages = [...messages, ...outboundMessages]
        .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime())
        .slice(0, limit);

      return allMessages.map((msg) => ({
        sid: msg.sid,
        status: msg.status,
        to: msg.to,
        from: msg.from,
        body: msg.body,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent || undefined,
        price: msg.price || undefined,
        priceUnit: msg.priceUnit || undefined,
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch message history: ${error.message}`);
    }
  }

  /**
   * Schedule SMS for future delivery
   */
  async scheduleSMS(
    message: Omit<SMSMessage, 'from'>,
    sendAt: Date
  ): Promise<{ scheduled: true; scheduledFor: Date; messageData: Omit<SMSMessage, 'from'> }> {
    // Note: Twilio doesn't support native scheduling, this would need to be implemented
    // with a job queue system (Bull, Agenda, etc.)
    const now = new Date();
    if (sendAt <= now) {
      throw new Error('Scheduled time must be in the future');
    }

    return {
      scheduled: true,
      scheduledFor: sendAt,
      messageData: message,
    };
  }

  /**
   * Calculate SMS cost
   */
  calculateSMSCost(messageCount: number, hasMedia: boolean = false): number {
    return messageCount * CostCalculator.calculateSMSCost(hasMedia);
  }

  /**
   * Validate phone number can receive SMS
   */
  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const normalizedNumber = normalizePhoneNumber(phoneNumber);
      const lookup = await this.client.lookups.v2
        .phoneNumbers(normalizedNumber)
        .fetch();

      return lookup.valid || false;
    } catch (error) {
      return false;
    }
  }
}
