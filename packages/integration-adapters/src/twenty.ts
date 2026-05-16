import { ITwentyClient, IntegrationHealth } from "./index";
import { Lead, Channel } from "@nyra/domain-models";
import { TwentyCRMClient } from "@nyra/crm-client";

export class TwentyIntegrationAdapter implements ITwentyClient {
  private client: TwentyCRMClient;

  constructor(endpoint: string, apiKey: string) {
    this.client = new TwentyCRMClient({ endpoint, apiKey });
  }

  async getLead(id: string): Promise<Lead> {
    const contact = await this.client.getContact(id);
    return this.mapToLead(contact);
  }

  async upsertLead(lead: Lead): Promise<Lead> {
    const payload = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      customFields: lead.metadata,
    };

    let result;
    if (lead.id) {
      result = await this.client.updateContact(lead.id, payload);
    } else {
      result = await this.client.createContact(payload as any);
    }

    return this.mapToLead(result);
  }

  async logCommunication(
    leadId: string,
    channel: Channel,
    content: string
  ): Promise<void> {
    await this.client.logCommunication({
      leadId,
      type: channel.toLowerCase(),
      description: content,
      direction: "outbound",
    });
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      // Simple search to verify connectivity
      await this.client.searchContacts({ limit: 1 });
      return { status: "HEALTHY" };
    } catch (e) {
      return { status: "DOWN", message: (e as Error).message };
    }
  }

  private mapToLead(contact: any): Lead {
    return {
      id: contact.id,
      firstName: contact.firstName || contact.name?.split(" ")[0] || "",
      lastName:
        contact.lastName || contact.name?.split(" ").slice(1).join(" ") || "",
      email: contact.email,
      phone: contact.phone,
      source: contact.source || "UNKNOWN",
      stage: (contact.status as any) || "NEW",
      metadata: contact.customFields || {},
    };
  }
}
