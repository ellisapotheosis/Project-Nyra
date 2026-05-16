import PQueue from 'p-queue'
import { GraphQLClient, gql } from 'graphql-request'

export type LeadInput = {
  name: string
  email: string
  phone: string
  source?: string
  customFields?: Record<string, unknown>
}

export type QuoteInput = {
  leadId: string
  loanAmount: number
  interestRate: number
  loanTermYears?: number
  downPayment?: number
  propertyValue?: number
  status?: string
  metadata?: Record<string, unknown>
}

export type CommunicationInput = {
  leadId: string
  type: string
  description: string
  direction: 'inbound' | 'outbound'
}

export type LeadSearchOptions = {
  filter?: Record<string, unknown>
  orderBy?: Record<string, unknown>
  limit?: number
  offset?: number
}

export type TwentyCRMClientOptions = {
  endpoint: string
  apiKey: string
  concurrency?: number
  operations?: Partial<TwentyOperations>
}

export type MortgageLeadInput = {
  personId: string
  loanPurpose: string
  loanAmount: number
  propertyValue?: number
  propertyState: string
  creditRange?: string
  timeframe?: string
  source: string
  campaignStatus?: string
  customFields?: Record<string, unknown>
}

export type TwentyOperations = {
  searchLeads: string
  getLead: string
  createLead: string
  updateLead: string
  bulkUpdateLead: string
  getQuotesForLead: string
  createQuote: string
  updateQuoteStatus: string
  logCommunication: string
  listCommunications: string
  createLoan: string
  getLoan: string
  updateLoan: string
  transitionLoanStatus: string
  enrollCampaign: string
  updateCampaignEnrollment: string
  getActiveCampaigns: string
  createMortgageLead: string
  getMortgageLead: string
  updateMortgageLead: string
  searchMortgageLeads: string
  getCampaign: string
  getCampaigns: string
  createCampaign: string
  updateCampaign: string
}

const defaultOperations: TwentyOperations = {
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
    mutation CreateMortgageLead($input: MortgageLeadCreateInput!) {
      createMortgageLead(input: $input) {
        id
        personId
        loanPurpose
        loanAmount
        propertyValue
        propertyState
        creditRange
        timeframe
        source
        campaignStatus
        createdAt
      }
    }
  `,
  getMortgageLead: gql`
    query GetMortgageLead($id: ID!) {
      mortgageLead(id: $id) {
        id
        personId
        loanPurpose
        loanAmount
        propertyValue
        propertyState
        creditRange
        timeframe
        source
        campaignStatus
        createdAt
        updatedAt
      }
    }
  `,
  updateMortgageLead: gql`
    mutation UpdateMortgageLead($id: ID!, $input: MortgageLeadUpdateInput!) {
      updateMortgageLead(id: $id, input: $input) {
        id
        campaignStatus
        updatedAt
      }
    }
  `,
  searchMortgageLeads: gql`
    query SearchMortgageLeads($filter: MortgageLeadFilter, $limit: Int) {
      mortgageLeads(filter: $filter, limit: $limit) {
        id
        personId
        loanPurpose
        loanAmount
        propertyValue
        propertyState
        creditRange
        timeframe
        campaignStatus
      }
    }
  `,
  searchLeads: gql`
    query SearchLeads($filter: LeadFilter, $orderBy: LeadOrderBy, $limit: Int, $offset: Int) {
      leads(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {
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
      }
    }
  `,
  updateLead: gql`
    mutation UpdateLead($id: ID!, $input: LeadUpdateInput!) {
      updateLead(id: $id, input: $input) {
        id
        name
      }
    }
  `,
  bulkUpdateLead: gql`
    mutation BulkUpdateLead($ids: [ID!]!, $input: LeadUpdateInput!) {
      bulkUpdateLeads(ids: $ids, input: $input) {
        id
      }
    }
  `,
  getQuotesForLead: gql`
    query GetQuotesForLead($leadId: ID!) {
      quotes(filter: { leadId: { eq: $leadId } }) {
        id
        interestRate
        loanAmount
        status
      }
    }
  `,
  createQuote: gql`
    mutation CreateQuote($input: QuoteCreateInput!) {
      createQuote(input: $input) {
        id
        interestRate
        loanAmount
      }
    }
  `,
  updateQuoteStatus: gql`
    mutation UpdateQuoteStatus($id: ID!, $input: QuoteUpdateInput!) {
      updateQuote(id: $id, input: $input) {
        id
        status
      }
    }
  `,
  logCommunication: gql`
    mutation LogCommunication($input: CommunicationCreateInput!) {
      createCommunication(input: $input) {
        id
      }
    }
  `,
  listCommunications: gql`
    query ListCommunications($leadId: ID!) {
      communications(filter: { leadId: { eq: $leadId } }) {
        id
        type
        description
        direction
        createdAt
      }
    }
  `,
  createLoan: gql`
    mutation CreateLoan($input: LoanCreateInput!) {
      createLoan(input: $input) {
        id
      }
    }
  `,
  getLoan: gql`
    query GetLoan($id: ID!) {
      loan(id: $id) {
        id
        status
        loanAmount
      }
    }
  `,
  updateLoan: gql`
    mutation UpdateLoan($id: ID!, $input: LoanUpdateInput!) {
      updateLoan(id: $id, input: $input) {
        id
      }
    }
  `,
  transitionLoanStatus: gql`
    mutation TransitionLoanStatus($id: ID!, $status: String!) {
      updateLoan(id: $id, input: { status: $status }) {
        id
      }
    }
  `,
  enrollCampaign: gql`
    mutation EnrollCampaign($input: CampaignEnrollmentCreateInput!) {
      createCampaignEnrollment(input: $input) {
        id
      }
    }
  `,
  updateCampaignEnrollment: gql`
    mutation UpdateCampaignEnrollment($id: ID!, $input: CampaignEnrollmentUpdateInput!) {
      updateCampaignEnrollment(id: $id, input: $input) {
        id
      }
    }
  `,
  getActiveCampaigns: gql`
    query GetActiveCampaigns {
      campaignEnrollments(filter: { status: { eq: "active" } }) {
        id
        campaignId
        leadId
      }
    }
  `,
}

export class TwentyCRMClient {
  private client: GraphQLClient
  private queue: PQueue
  private operations: TwentyOperations

  constructor(options: TwentyCRMClientOptions) {
    this.client = new GraphQLClient(options.endpoint, {
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
    })
    this.queue = new PQueue({ concurrency: options.concurrency || 5 })
    this.operations = { ...defaultOperations, ...options.operations }
  }

  async searchContacts(options: LeadSearchOptions = {}) {
    return this.queue.add(() =>
      this.client.request<{ leads: any[] }>(this.operations.searchLeads, options)
    )
  }

  async getContact(id: string) {
    return this.queue.add(() =>
      this.client.request<{ lead: any }>(this.operations.getLead, { id })
    )
  }

  async createContact(input: LeadInput) {
    return this.queue.add(() =>
      this.client.request<{ createLead: any }>(this.operations.createLead, { input })
    )
  }

  async updateContact(id: string, input: Partial<LeadInput>) {
    return this.queue.add(() =>
      this.client.request<{ updateLead: any }>(this.operations.updateLead, { id, input })
    )
  }

  async createQuote(input: QuoteInput) {
    return this.queue.add(() =>
      this.client.request<{ createQuote: any }>(this.operations.createQuote, { input })
    )
  }

  async logCommunication(input: CommunicationInput) {
    return this.queue.add(() =>
      this.client.request<{ createCommunication: any }>(this.operations.logCommunication, { input })
    )
  }

  async createMortgageLead(input: MortgageLeadInput) {
    return this.queue.add(() =>
      this.client.request<{ createMortgageLead: any }>(this.operations.createMortgageLead, { input })
    )
  }

  async getMortgageLead(id: string) {
    return this.queue.add(() =>
      this.client.request<{ mortgageLead: any }>(this.operations.getMortgageLead, { id })
    )
  }

  async searchMortgageLeads(filter: Record<string, unknown> = {}, limit = 100) {
    return this.queue.add(() =>
      this.client.request<{ mortgageLeads: any[] }>(this.operations.searchMortgageLeads, { filter, limit })
    )
  }

  async request<T>(operationName: keyof TwentyOperations, variables: Record<string, unknown>): Promise<T> {
    return this.queue.add(() =>
      this.client.request<T>(this.operations[operationName], variables)
    ) as Promise<T>
  }
}
