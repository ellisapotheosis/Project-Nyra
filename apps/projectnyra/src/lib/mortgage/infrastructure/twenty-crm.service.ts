import { Result } from "../result";
import { Lead } from "../entities/lead.entity";

export interface ITwentyCRMService {
  syncLead(lead: Lead): Promise<Result<string>>;
}

export class TwentyCRMService implements ITwentyCRMService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.TWENTY_API_URL || "http://twenty:3000/rest";
    this.apiKey = process.env.TWENTY_API_KEY || "mock-key";
  }

  async syncLead(lead: Lead): Promise<Result<string>> {
    try {
      // 1. Check if person exists in Twenty CRM
      const searchRes = await fetch(
        `${this.baseUrl}/people?filter[emails][contains]=${lead.borrower.email}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      void searchRes;

      // Since Twenty CRM is system of record, we always sync data over
      const personData = {
        name: {
          firstName: lead.borrower.firstName,
          lastName: lead.borrower.lastName,
        },
        emails: [lead.borrower.email],
        phones: [lead.borrower.phone],
        city: "", // Can parse from zip if needed
      };
      void personData;

      // Mocking the creation for now as we don't have a live Twenty instance
      // const createRes = await fetch(`${this.baseUrl}/people`, {
      //   method: 'POST',
      //   body: JSON.stringify(personData),
      //   headers: { ... }
      // });
      // const createdPerson = await createRes.json();

      const mockTwentyId = `twenty_${Date.now()}`;

      // Also create an Opportunity/Company record linked to this person
      // Representing the Mortgage Application

      return Result.ok(mockTwentyId);
    } catch (error: any) {
      console.error("Failed to sync lead to Twenty CRM", error);
      return Result.fail(`Twenty CRM sync failed: ${error.message}`);
    }
  }
}
