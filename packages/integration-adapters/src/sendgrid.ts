import { ICommunicationProvider, IntegrationHealth } from "./index";
import sgMail from "@sendgrid/mail";

export class SendGridIntegrationAdapter implements ICommunicationProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    sgMail.setApiKey(this.apiKey);
  }

  async send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string; error?: string }> {
    try {
      const [response] = await sgMail.send({
        to: to,
        from: this.fromEmail,
        subject: "Update from Project Nyra",
        text: content,
        html: `<p>${content.replace(/\n/g, "<br/>")}</p>`,
      });
      return {
        success: true,
        providerId: response.headers["x-message-id"] as string,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      // SendGrid doesn't have a simple health check without sending a mail or complex API calls.
      // We'll just check if the API key is set for now.
      if (!this.apiKey) throw new Error("API Key missing");
      return { status: "HEALTHY" };
    } catch (e) {
      return { status: "DOWN", message: (e as Error).message };
    }
  }
}
