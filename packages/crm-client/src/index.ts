import PQueue from "p-queue";
import { GraphQLClient, gql } from "graphql-request";

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  source?: string;
  customFields?: Record<string, unknown>;
};

export type QuoteInput = {
  leadId: string;
  loanAmount: number;
  interestRate: number;
  loanTermYears?: number;
  downPayment?: number;
  propertyValue?: number;
  status?: string;
  metadata?: Record<string, unknown>;
};

export type CommunicationInput = {
  leadId: string;
  type: string;
  description: string;
  direction: "inbound" | "outbound";
};

export type LeadSearchOptions = {
  filter?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  limit?: number;
  offset?: number;
};

export type TwentyCRMClientOptions = {
  endpoint: string;
  apiKey: string;
  concurrency?: number;
  operations?: Partial<TwentyOperations>;
};

export type MortgageLeadInput = {
  personId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  loanPurpose?: string;
  loanAmount?: number;
  propertyState?: string;
  source?: string;
  campaignStatus?: string;
  customFields?: Record<string, unknown>;
};

export type TwentyOperations = {
  searchLeads: string;
  getLead: string;
  createLead: string;
  updateLead: string;
  bulkUpdateLead: string;
  getQuotesForLead: string;
  createQuote: string;
  updateQuoteStatus: string;
  logCommunication: string;
  listCommunications: string;
  createLoan: string;
  getLoan: string;
  updateLoan: string;
  transitionLoanStatus: string;
  enrollCampaign: string;
  updateCampaignEnrollment: string;
  getActiveCampaigns: string;
  createMortgageLead: string;
  getMortgageLead: string;
  updateMortgageLead: string;
  searchMortgageLeads: string;
  getCampaign: string;
  getCampaigns: string;
  createCampaign: string;
  updateCampaign: string;
};

const defaultOperations: TwentyOperations = {
  // ... (previous operations)
  getCampaign: gql`
    query GetCampaign($id: ID!) {
      campaign(id: $id) {
        id
        name
        steps
        loanPurpose
        active
      }
    }
  `,
  getCampaigns: gql`
    query GetCampaigns {
      campaigns {
        id
        name
        steps
        loanPurpose
        active
      }
    }
  `,
  createCampaign: gql`
    mutation CreateCampaign($input: CampaignCreateInput!) {
      createCampaign(input: $input) {
        id
        name
      }
    }
  `,
  updateCampaign: gql`
    mutation UpdateCampaign($id: ID!, $input: CampaignUpdateInput!) {
      updateCampaign(id: $id, input: $input) {
        id
        name
      }
    }
  `,
  createMortgageLead: gql`
    mutation CreateMortgageLead($data: MortgageLeadCreateInput!) {
      createMortgageLead(data: $data) {
        id
        firstName
        lastName
        email {
          primaryEmail
        }
        phone {
          primaryPhoneNumber
        }
        loanPurpose
        loanAmount {
          amountMicros
          currencyCode
        }
        propertyState
        source
        status
        rawPayload
        createdAt
      }
    }
  `,
  getMortgageLead: gql`
    query GetMortgageLead($id: UUID!) {
      mortgageLead(filter: { id: { eq: $id } }) {
        id
        firstName
        lastName
        email {
          primaryEmail
        }
        phone {
          primaryPhoneNumber
        }
        loanPurpose
        loanAmount {
          amountMicros
          currencyCode
        }
        propertyState
        source
        status
        rawPayload
        createdAt
        updatedAt
      }
    }
  `,
  updateMortgageLead: gql`
    mutation UpdateMortgageLead($id: UUID!, $data: MortgageLeadUpdateInput!) {
      updateMortgageLead(id: $id, data: $data) {
        id
        status
        rawPayload
        updatedAt
      }
    }
  `,
  searchMortgageLeads: gql`
    query SearchMortgageLeads($filter: MortgageLeadFilterInput, $first: Int) {
      mortgageLeads(filter: $filter, first: $first) {
        id
        firstName
        lastName
        email {
          primaryEmail
        }
        phone {
          primaryPhoneNumber
        }
        loanPurpose
        loanAmount {
          amountMicros
          currencyCode
        }
        propertyState
        source
        status
        rawPayload
      }
    }
  `,
  searchLeads: gql`
    query SearchLeads(
      $filter: LeadFilter
      $orderBy: LeadOrderBy
      $limit: Int
      $offset: Int
    ) {
      leads(
        filter: $filter
        orderBy: $orderBy
        limit: $limit
        offset: $offset
      ) {
        id
        name
        email
        phone
        status
        source
        createdAt
        updatedAt
        customFields
      }
    }
  `,
  getLead: gql`
    query GetLead($id: ID!) {
      lead(id: $id) {
        id
        name
        email
        phone
        status
        source
        createdAt
        updatedAt
        customFields
      }
    }
  `,
  createLead: gql`
    mutation CreateLead($input: LeadCreateInput!) {
      createLead(input: $input) {
        id
        name
        email
        phone
        status
        source
        customFields
      }
    }
  `,
  updateLead: gql`
    mutation UpdateLead($id: ID!, $input: LeadUpdateInput!) {
      updateLead(id: $id, input: $input) {
        id
        customFields
      }
    }
  `,
  bulkUpdateLead: gql`
    mutation BulkUpdate($items: [LeadBulkUpdateInput!]!) {
      bulkUpdateLead(input: $items) {
        id
      }
    }
  `,
  getQuotesForLead: gql`
    query GetQuotes($leadId: ID!) {
      quotes(filter: { leadId: $leadId }, orderBy: { createdAt: DESC }) {
        id
        quoteNumber
        loanAmount
        interestRate
        status
        expiresAt
        createdAt
        metadata
      }
    }
  `,
  createQuote: gql`
    mutation CreateQuote($input: QuoteCreateInput!) {
      createQuote(input: $input) {
        id
        quoteNumber
        status
        createdAt
        metadata
        loanAmount
        interestRate
      }
    }
  `,
  updateQuoteStatus: gql`
    mutation UpdateQuote($id: ID!, $input: QuoteUpdateInput!) {
      updateQuote(id: $id, input: $input) {
        id
        status
        updatedAt
      }
    }
  `,
  logCommunication: gql`
    mutation CreateActivity($input: ActivityCreateInput!) {
      createActivity(input: $input) {
        id
        type
        description
        leadId
        createdAt
      }
    }
  `,
  listCommunications: gql`
    query GetActivities($leadId: ID!, $limit: Int) {
      activities(
        filter: { leadId: $leadId }
        orderBy: { createdAt: DESC }
        limit: $limit
      ) {
        id
        type
        description
        createdAt
        createdBy {
          id
          name
        }
      }
    }
  `,
  createLoan: gql`
    mutation CreateLoan($input: LoanCreateInput!) {
      createLoan(input: $input) {
        id
        loanNumber
        status
        loanAmount
        updatedAt
      }
    }
  `,
  getLoan: gql`
    query GetLoan($id: ID!) {
      loan(id: $id) {
        id
        loanNumber
        status
        loanAmount
        customFields
      }
    }
  `,
  updateLoan: gql`
    mutation UpdateLoan($id: ID!, $input: LoanUpdateInput!) {
      updateLoan(id: $id, input: $input) {
        id
        status
        loanAmount
      }
    }
  `,
  transitionLoanStatus: gql`
    mutation TransitionLoan($id: ID!, $status: String!) {
      transitionLoanStatus(id: $id, status: $status) {
        id
        status
      }
    }
  `,
  enrollCampaign: gql`
    mutation EnrollCampaign($input: CampaignEnrollmentInput!) {
      enrollCampaign(input: $input) {
        id
        campaignName
        status
      }
    }
  `,
  updateCampaignEnrollment: gql`
    mutation UpdateCampaign($id: ID!, $input: CampaignEnrollmentUpdateInput!) {
      updateCampaignEnrollment(id: $id, input: $input) {
        id
        status
        currentStep
      }
    }
  `,
  getActiveCampaigns: gql`
    query ActiveCampaigns($contactId: ID!) {
      campaignEnrollments(filter: { contactId: $contactId, status: "active" }) {
        id
        campaignName
        currentStep
        nextTouch
      }
    }
  `,
};

export class CRMError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, payload?: { code?: string; details?: unknown }) {
    super(message);
    this.name = "CRMError";
    this.code = payload?.code;
    this.details = payload?.details;
  }
}

export class TwentyCRMClient {
  private readonly client: GraphQLClient;
  private readonly queue: PQueue;
  private readonly operations: TwentyOperations;

  constructor(options: TwentyCRMClientOptions) {
    if (!options.endpoint || !options.apiKey) {
      throw new CRMError(
        "endpoint and apiKey are required to initialize TwentyCRMClient"
      );
    }

    this.client = new GraphQLClient(options.endpoint, {
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.queue = new PQueue({ concurrency: options.concurrency ?? 6 });
    this.operations = { ...defaultOperations, ...(options.operations ?? {}) };
  }

  public async request<T>(
    operation: keyof TwentyOperations,
    variables: Record<string, unknown>
  ): Promise<T> {
    const result = await this.queue.add(async () => {
      try {
        const payload = await this.client.request<T>(
          this.operations[operation],
          variables
        );
        return payload;
      } catch (error: unknown) {
        throw new CRMError("GraphQL request failed", {
          details: error,
        });
      }
    });

    if (!result) {
      throw new CRMError("Request failed to return data");
    }
    return result;
  }

  public async createContact(payload: LeadInput) {
    return this.createMortgageLead(toMortgageLeadInput(payload));
  }

  public async updateContact(id: string, payload: Record<string, unknown>) {
    return this.updateMortgageLead(id, toMortgageLeadInput(payload));
  }

  public async searchContacts(options: LeadSearchOptions = {}) {
    const { filter, limit = 50 } = options;
    if (filter && Object.keys(filter).length > 0) {
      return [];
    }
    return this.searchMortgageLeads({}, limit);
  }

  public async bulkUpdateContacts(
    items: Array<{ id: string; input: Record<string, unknown> }>
  ) {
    const chunkSize = 20;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await this.request("bulkUpdateLead", { items: chunk });
    }
  }

  public async getContact(id: string) {
    try {
      return await this.getMortgageLead(id);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return undefined;
      }
      throw error;
    }
  }

  public async createQuote(input: QuoteInput) {
    const result = await this.request<{ createQuote: any }>("createQuote", {
      input,
    });
    return result.createQuote;
  }

  public async getQuotesForLead(leadId: string) {
    const result = await this.request<{ quotes: any[] }>("getQuotesForLead", {
      leadId,
    });
    return result.quotes;
  }

  public async markQuoteSent(quoteId: string) {
    const result = await this.request<{ updateQuote: any }>(
      "updateQuoteStatus",
      { id: quoteId, input: { status: "sent" } }
    );
    return result.updateQuote;
  }

  public async markQuoteViewed(quoteId: string) {
    const result = await this.request<{ updateQuote: any }>(
      "updateQuoteStatus",
      { id: quoteId, input: { status: "viewed" } }
    );
    return result.updateQuote;
  }

  public async logCommunication(input: CommunicationInput) {
    const result = await this.request<{ createActivity: any }>(
      "logCommunication",
      { input }
    );
    return result.createActivity;
  }

  public async timeline(leadId: string, limit = 25) {
    const result = await this.request<{ activities: any[] }>(
      "listCommunications",
      { leadId, limit }
    );
    return result.activities;
  }

  public async createLoan(input: Record<string, unknown>) {
    const result = await this.request<{ createLoan: any }>("createLoan", {
      input,
    });
    return result.createLoan;
  }

  public async updateLoan(id: string, input: Record<string, unknown>) {
    const result = await this.request<{ updateLoan: any }>("updateLoan", {
      id,
      input,
    });
    return result.updateLoan;
  }

  public async transitionLoanStatus(id: string, status: string) {
    const result = await this.request<{ transitionLoanStatus: any }>(
      "transitionLoanStatus",
      { id, status }
    );
    return result.transitionLoanStatus;
  }

  public async getLoan(id: string) {
    const result = await this.request<{ loan: any }>("getLoan", { id });
    return result.loan;
  }

  public async enrollCampaign(input: Record<string, unknown>) {
    const result = await this.request<{ enrollCampaign: any }>(
      "enrollCampaign",
      { input }
    );
    return result.enrollCampaign;
  }

  public async updateCampaignEnrollment(
    id: string,
    input: Record<string, unknown>
  ) {
    const result = await this.request<{ updateCampaignEnrollment: any }>(
      "updateCampaignEnrollment",
      { id, input }
    );
    return result.updateCampaignEnrollment;
  }

  public async createMortgageLead(input: MortgageLeadInput) {
    const result = await this.request<{ createMortgageLead: any }>(
      "createMortgageLead",
      {
        data: toMortgageLeadInput(input),
      }
    );
    return result.createMortgageLead;
  }

  public async getMortgageLead(id: string) {
    const result = await this.request<{ mortgageLead: any }>(
      "getMortgageLead",
      { id }
    );
    return result.mortgageLead;
  }

  public async updateMortgageLead(id: string, input: Record<string, unknown>) {
    const result = await this.request<{ updateMortgageLead: any }>(
      "updateMortgageLead",
      {
        id,
        data: toMortgageLeadInput(input),
      }
    );
    return result.updateMortgageLead;
  }

  public async searchMortgageLeads(
    filter: Record<string, unknown> = {},
    limit = 50
  ) {
    const result = await this.request<{
      mortgageLeads: any[] | Record<string, unknown> | null;
    }>("searchMortgageLeads", {
      filter,
      first: limit,
    });
    if (!result.mortgageLeads) {
      return [];
    }
    return Array.isArray(result.mortgageLeads)
      ? result.mortgageLeads
      : [result.mortgageLeads];
  }

  public async getActiveCampaigns(contactId: string) {
    const result = await this.request<{ campaignEnrollments: any[] }>(
      "getActiveCampaigns",
      { contactId }
    );
    return result.campaignEnrollments;
  }
}

function toMortgageLeadInput(
  input: Record<string, unknown>
): Record<string, unknown> {
  const fullName = typeof input.name === "string" ? input.name.trim() : "";
  const [firstFromName, ...lastParts] = fullName.split(/\s+/).filter(Boolean);
  const customFields = isRecord(input.customFields) ? input.customFields : {};
  const loanAmount =
    typeof customFields.loanAmount === "number"
      ? customFields.loanAmount
      : typeof input.loanAmount === "number"
        ? input.loanAmount
        : undefined;

  return {
    name:
      fullName ||
      [input.firstName, input.lastName].filter(Boolean).join(" ") ||
      "Nyra Lead",
    firstName: stringOrUndefined(input.firstName) ?? firstFromName ?? "Nyra",
    lastName:
      stringOrUndefined(input.lastName) ??
      stringOrUndefined(lastParts.join(" ")) ??
      "Lead",
    email: stringOrUndefined(input.email)
      ? { primaryEmail: stringOrUndefined(input.email), additionalEmails: null }
      : undefined,
    phone: stringOrUndefined(input.phone)
      ? {
          primaryPhoneNumber: stringOrUndefined(input.phone),
          primaryPhoneCountryCode: "US",
          primaryPhoneCallingCode: "+1",
          additionalPhones: null,
        }
      : undefined,
    source: "DEFAULT",
    loanPurpose: "DEFAULT",
    loanAmount:
      loanAmount !== undefined
        ? {
            amountMicros: String(Math.round(loanAmount * 1_000_000)),
            currencyCode: "USD",
          }
        : undefined,
    propertyState:
      stringOrUndefined(customFields.propertyState) ??
      stringOrUndefined(input.propertyState),
    status: "DEFAULT",
    optedOut: Boolean(customFields.doNotContact),
    consentSms: customFields.consentStatus === "OPTED_IN",
    consentEmail: customFields.consentStatus === "OPTED_IN",
    consentCall: false,
    rawPayload: {
      ...customFields,
      source: input.source,
      campaignStatus: customFields.campaignStatus,
      updatedFromCrmApiAt: new Date().toISOString(),
    },
  };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRecordNotFoundError(error: unknown): boolean {
  if (!(error instanceof CRMError) || !isRecord(error.details)) {
    return false;
  }

  const response = error.details.response;
  if (!isRecord(response) || !Array.isArray(response.errors)) {
    return false;
  }

  return response.errors.some(
    (entry) =>
      isRecord(entry) &&
      isRecord(entry.extensions) &&
      entry.extensions.code === "NOT_FOUND"
  );
}
