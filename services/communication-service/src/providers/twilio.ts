import { ProviderChannel } from "../index.js";

export interface SendOptions {
  to: string;
  from: string;
  body: string;
  subject?: string;
  leadId: string;
  isDraft?: boolean;
}

export interface SendResult {
  providerMessageId: string;
  status: "QUEUED" | "SENT" | "FAILED" | "DRAFTED";
  error?: string;
}

export interface ICommunicationProvider {
  send(options: SendOptions): Promise<SendResult>;
}

export class TwilioProvider implements ICommunicationProvider {
  private readonly accountSid: string;
  private readonly authToken: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "AC_mock";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "token_mock";
  }

  async send(options: SendOptions): Promise<SendResult> {
    if (!this.accountSid || !this.authToken) {
      return {
        providerMessageId: "mock",
        status: "FAILED",
        error: "Twilio credentials missing",
      };
    }

    // In a real implementation, we would use the twilio npm package or fetch
    console.log(
      `[Twilio] Sending SMS to ${options.to}: ${options.body.slice(0, 20)}...`
    );

    return {
      providerMessageId: `tw_${Date.now()}`,
      status: "QUEUED",
    };
  }
}
