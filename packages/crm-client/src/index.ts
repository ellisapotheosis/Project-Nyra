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
  propertyState: string
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
    mutation CreateMortgageLead($input: MortgageLeadCreateInput!) {
      createMortgageLead(input: $input) {
        id
        personId
        loanPurpose
        loanAmount
        propertyState
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
        propertyState
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
      activities(filter: { leadId: $leadId }, orderBy: { createdAt: DESC }, limit: $limit) {
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
  `
}

export class CRMError extends Error {
  public readonly code?: string
  public readonly details?: unknown

  constructor(message: string, payload?: { code?: string; details?: unknown }) {
    super(message)
    this.name = 'CRMError'
    this.code = payload?.code
    this.details = payload?.details
  }
}

export class TwentyCRMClient {
  private readonly client: GraphQLClient
  private readonly queue: PQueue
  private readonly operations: TwentyOperations

  constructor(private readonly options: TwentyCRMClientOptions) {
    if (!options.endpoint || !options.apiKey) {
      throw new CRMError('endpoint and apiKey are required to initialize TwentyCRMClient')
    }

    this.client = new GraphQLClient(options.endpoint, {
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    this.queue = new PQueue({ concurrency: options.concurrency ?? 6 })
    this.operations = { ...defaultOperations, ...(options.operations ?? {}) }
  }

  private async request<T>(operation: keyof TwentyOperations, variables: Record<string, unknown>) {
    return this.queue.add(async () => {
      try {
        const payload = await this.client.request<T>(this.operations[operation], variables)
        return payload
      } catch (error: unknown) {
        throw new CRMError('GraphQL request failed', {
          details: error
        })
      }
    })
  }

  public async createContact(payload: LeadInput) {
    const result = await this.request<{ createLead: any }>('createLead', { input: payload })
    return result.createLead
  }

  public async updateContact(id: string, payload: Record<string, unknown>) {
    const result = await this.request<{ updateLead: any }>('updateLead', { id, input: payload })
    return result.updateLead
  }

  public async searchContacts(options: LeadSearchOptions = {}) {
    const { filter, orderBy, limit = 50, offset = 0 } = options
    const result = await this.request<{ leads: any[] }>('searchLeads', { filter, orderBy, limit, offset })
    return result.leads
  }

  public async bulkUpdateContacts(items: Array<{ id: string; input: Record<string, unknown> }>) {
    const chunkSize = 20
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize)
      await this.request('bulkUpdateLead', { items: chunk })
    }
  }

  public async getContact(id: string) {
    const result = await this.request<{ lead: any }>('getLead', { id })
    return result.lead
  }

  public async createQuote(input: QuoteInput) {
    const result = await this.request<{ createQuote: any }>('createQuote', { input })
    return result.createQuote
  }

  public async getQuotesForLead(leadId: string) {
    const result = await this.request<{ quotes: any[] }>('getQuotesForLead', { leadId })
    return result.quotes
  }

  public async markQuoteSent(quoteId: string) {
    const result = await this.request<{ updateQuote: any }>('updateQuoteStatus', { id: quoteId, input: { status: 'sent' } })
    return result.updateQuote
  }

  public async markQuoteViewed(quoteId: string) {
    const result = await this.request<{ updateQuote: any }>('updateQuoteStatus', { id: quoteId, input: { status: 'viewed' } })
    return result.updateQuote
  }

  public async logCommunication(input: CommunicationInput) {
    const result = await this.request<{ createActivity: any }>('logCommunication', { input })
    return result.createActivity
  }

  public async timeline(leadId: string, limit = 25) {
    const result = await this.request<{ activities: any[] }>('listCommunications', { leadId, limit })
    return result.activities
  }

  public async createLoan(input: Record<string, unknown>) {
    const result = await this.request<{ createLoan: any }>('createLoan', { input })
    return result.createLoan
  }

  public async updateLoan(id: string, input: Record<string, unknown>) {
    const result = await this.request<{ updateLoan: any }>('updateLoan', { id, input })
    return result.updateLoan
  }

  public async transitionLoanStatus(id: string, status: string) {
    const result = await this.request<{ transitionLoanStatus: any }>('transitionLoanStatus', { id, status })
    return result.transitionLoanStatus
  }

  public async getLoan(id: string) {
    const result = await this.request<{ loan: any }>('getLoan', { id })
    return result.loan
  }

  public async enrollCampaign(input: Record<string, unknown>) {
    const result = await this.request<{ enrollCampaign: any }>('enrollCampaign', { input })
    return result.enrollCampaign
  }

  public async updateCampaignEnrollment(id: string, input: Record<string, unknown>) {
    const result = await this.request<{ updateCampaignEnrollment: any }>('updateCampaignEnrollment', { id, input })
    return result.updateCampaignEnrollment
  }

  public async createMortgageLead(input: MortgageLeadInput) {
    const result = await this.request<{ createMortgageLead: any }>('createMortgageLead', { input })
    return result.createMortgageLead
  }

  public async getMortgageLead(id: string) {
    const result = await this.request<{ mortgageLead: any }>('getMortgageLead', { id })
    return result.mortgageLead
  }

  public async updateMortgageLead(id: string, input: Record<string, unknown>) {
    const result = await this.request<{ updateMortgageLead: any }>('updateMortgageLead', { id, input })
    return result.updateMortgageLead
  }

  public async searchMortgageLeads(filter: Record<string, unknown> = {}, limit = 50) {
    const result = await this.request<{ mortgageLeads: any[] }>('searchMortgageLeads', { filter, limit })
    return result.mortgageLeads
  }

  public async getActiveCampaigns(contactId: string) {
    const result = await this.request<{ campaignEnrollments: any[] }>('getActiveCampaigns', { contactId })
    return result.campaignEnrollments
  }
}
