import { ICommunicationProvider, SendOptions, SendResult } from "./twilio.js";

export class SendGridProvider implements ICommunicationProvider {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || "sg_mock";
  }

  async send(options: SendOptions): Promise<SendResult> {
    console.log(
      `[SendGrid] Sending Email to ${options.to}: ${options.subject}`
    );

    return {
      providerMessageId: `sg_${Date.now()}`,
      status: "SENT",
    };
  }
}

export class OutlookProvider implements ICommunicationProvider {
  async send(options: SendOptions): Promise<SendResult> {
    if (options.isDraft) {
      console.log(`[Outlook] Creating DRAFT for ${options.to}`);
      return {
        providerMessageId: `out_draft_${Date.now()}`,
        status: "DRAFTED",
      };
    }

    console.log(`[Outlook] Sending Email via Graph API to ${options.to}`);
    return {
      providerMessageId: `out_${Date.now()}`,
      status: "SENT",
    };
  }
}
