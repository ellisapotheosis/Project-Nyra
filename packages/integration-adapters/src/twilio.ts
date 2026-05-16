import { ICommunicationProvider, IntegrationHealth } from "./index";
import twilio from "twilio";

export class TwilioIntegrationAdapter implements ICommunicationProvider {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string; error?: string }> {
    try {
      const message = await this.client.messages.create({
        body: content,
        from: this.fromNumber,
        to: to,
      });
      return { success: true, providerId: message.sid };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      await this.client.api.accounts(this.client.accountSid).fetch();
      return { status: "HEALTHY" };
    } catch (e) {
      return { status: "DOWN", message: (e as Error).message };
    }
  }
}
