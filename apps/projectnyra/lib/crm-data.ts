import { applications as mockApplications, crmOverview as mockCrmOverview, leads as mockLeads, type ApplicationRecord, type LeadRecord } from "@/lib/mock-data"
import { NYRA_ENABLE_MOCKS } from "@/lib/api/config"

type CrmOverview = typeof mockCrmOverview

export type WorkspaceData = {
  leads: LeadRecord[]
  applications: ApplicationRecord[]
  crmOverview: CrmOverview
  recentActivity: string[]
  source: "mock" | "crm-api" | "twenty-mcp" | "twenty-graphql"
}

const CRM_API_URL = process.env.CRM_API_URL
const CRM_API_KEY = process.env.CRM_API_KEY
const TWENTY_MCP_URL = process.env.TWENTY_MCP_URL
const TWENTY_CRM_URL = process.env.TWENTY_CRM_URL
const TWENTY_CRM_API_KEY = process.env.TWENTY_CRM_API_KEY

function splitName(fullName?: string | null) {
  if (!fullName) {
    return { firstName: "Unknown", lastName: "Borrower" }
  }

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

function getPrimaryString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" && item.trim()) {
        return item
      }
      if (item && typeof item === "object") {
        const object = item as Record<string, unknown>
        for (const key of ["primaryEmail", "email", "address", "value", "primaryPhoneNumber", "number"]) {
          const nested = object[key]
          if (typeof nested === "string" && nested.trim()) {
            return nested
          }
        }
      }
    }
  }

  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>
    for (const key of ["primaryEmail", "email", "address", "value", "primaryPhoneNumber", "number"]) {
      const nested = object[key]
      if (typeof nested === "string" && nested.trim()) {
        return nested
      }
    }
  }

  return undefined
}

function numberOrDefault(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""))
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function mapLeadRecord(raw: Record<string, unknown>, index: number): LeadRecord {
  const customFields = (raw.customFields && typeof raw.customFields === "object" ? raw.customFields : {}) as Record<string, unknown>
  const nestedName = raw.name && typeof raw.name === "object" ? (raw.name as Record<string, unknown>) : null
  const split = splitName(typeof raw.name === "string" ? raw.name : undefined)
  const firstName =
    (typeof raw.firstName === "string" && raw.firstName) ||
    (typeof nestedName?.firstName === "string" && nestedName.firstName) ||
    split.firstName
  const lastName =
    (typeof raw.lastName === "string" && raw.lastName) ||
    (typeof nestedName?.lastName === "string" && nestedName.lastName) ||
    split.lastName
  const city =
    (typeof raw.city === "string" && raw.city) ||
    (typeof customFields.city === "string" && customFields.city) ||
    (typeof raw.location === "string" && raw.location) ||
    ""
  const state =
    (typeof raw.state === "string" && raw.state) ||
    (typeof customFields.state === "string" && customFields.state) ||
    ""
  const location = [city, state].filter(Boolean).join(", ") || "CRM Synced"
  const updatedAt =
    (typeof raw.updatedAt === "string" && raw.updatedAt) ||
    (typeof raw.createdAt === "string" && raw.createdAt) ||
    new Date().toISOString()

  return {
    id: (typeof raw.id === "string" && raw.id) || `crm-lead-${index + 1}`,
    firstName,
    lastName,
    email: getPrimaryString(raw.email) || getPrimaryString(raw.emails) || "unknown@example.com",
    phone: getPrimaryString(raw.phone) || getPrimaryString(raw.phones) || "Unavailable",
    campaignStatus:
      (typeof raw.campaignStatus === "string" && raw.campaignStatus) ||
      (typeof raw.status === "string" && raw.status) ||
      "ACTIVE",
    loanPurpose:
      (typeof customFields.loanPurpose === "string" && customFields.loanPurpose) ||
      (typeof raw.loanPurpose === "string" && raw.loanPurpose) ||
      (typeof raw.source === "string" && raw.source) ||
      "Mortgage Inquiry",
    loanAmount:
      numberOrDefault(customFields.loanAmount, 0) ||
      numberOrDefault(raw.loanAmount, 0) ||
      250000,
    campaignId:
      (typeof raw.campaignId === "string" && raw.campaignId) ||
      (typeof customFields.campaignId === "string" && customFields.campaignId) ||
      "crm-sync",
    lastTouch:
      (typeof raw.lastTouch === "string" && raw.lastTouch) ||
      updatedAt,
    nextTouch:
      (typeof raw.nextTouch === "string" && raw.nextTouch) ||
      updatedAt,
    location,
    creditBand:
      (typeof customFields.creditScoreRange === "string" && customFields.creditScoreRange) ||
      (typeof raw.creditBand === "string" && raw.creditBand) ||
      "Unknown",
    source: (typeof raw.source === "string" && raw.source) || "twenty-crm",
    stage:
      (typeof raw.stage === "string" && raw.stage) ||
      (typeof raw.status === "string" && raw.status) ||
      "New",
  }
}

function mapApplicationRecord(raw: Record<string, unknown>, index: number): ApplicationRecord {
  const amount =
    numberOrDefault(raw.amount, 0) ||
    numberOrDefault(raw.loanAmount, 0) ||
    numberOrDefault(raw.value, 0) ||
    250000
  const borrowerName =
    (typeof raw.borrower === "string" && raw.borrower) ||
    (typeof raw.name === "string" && raw.name) ||
    ((raw.person && typeof raw.person === "object" && typeof (raw.person as Record<string, unknown>).name === "string")
      ? ((raw.person as Record<string, unknown>).name as string)
      : "") ||
    `Application ${index + 1}`

  return {
    id: (typeof raw.id === "string" && raw.id) || `crm-app-${index + 1}`,
    borrower: borrowerName,
    product:
      (typeof raw.product === "string" && raw.product) ||
      (typeof raw.loanType === "string" && raw.loanType) ||
      (typeof raw.type === "string" && raw.type) ||
      "Mortgage Application",
    amount,
    status:
      (typeof raw.status === "string" && raw.status) ||
      (typeof raw.stage === "string" && raw.stage) ||
      "Open",
    milestone:
      (typeof raw.milestone === "string" && raw.milestone) ||
      (typeof raw.stage === "string" && raw.stage) ||
      "In review",
    loanOfficer:
      (typeof raw.loanOfficer === "string" && raw.loanOfficer) ||
      (raw.assignee && typeof raw.assignee === "object" && typeof (raw.assignee as Record<string, unknown>).name === "string"
        ? ((raw.assignee as Record<string, unknown>).name as string)
        : "Ellis Andersen"),
    updatedAt:
      (typeof raw.updatedAt === "string" && raw.updatedAt) ||
      (typeof raw.createdAt === "string" && raw.createdAt) ||
      new Date().toISOString(),
  }
}

function buildOverview(leads: LeadRecord[], applications: ApplicationRecord[]): CrmOverview {
  const totalPipelineValue = applications.reduce((sum, application) => sum + application.amount, 0)
  const qualifiedStages = new Set(["Qualified", "Application", "Pre-approval", "Processing", "Conditionally Approved"])
  const qualifiedCount = leads.filter((lead) => qualifiedStages.has(lead.stage)).length
  const conversionRate = leads.length ? `${Math.round((qualifiedCount / leads.length) * 100)}%` : "0%"
  const sortedTimes = applications
    .map((application) => Date.parse(application.updatedAt))
    .filter((timestamp) => Number.isFinite(timestamp))
    .sort((a, b) => b - a)
  const averageCycleDays = sortedTimes.length
    ? Math.max(1, Math.round((Date.now() - sortedTimes[sortedTimes.length - 1]) / (1000 * 60 * 60 * 24)))
    : 14

  return {
    pipelineValue: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(totalPipelineValue || 0),
    activeLeads: leads.length,
    activeApplications: applications.length,
    conversionRate,
    averageCycle: `${averageCycleDays} Days`,
  }
}

function buildRecentActivity(leads: LeadRecord[], applications: ApplicationRecord[]) {
  const leadActivity = leads.slice(0, 3).map((lead) => {
    return `Lead synced from ${lead.source} for ${lead.firstName} ${lead.lastName} • ${lead.stage} • ${lead.loanPurpose}`
  })

  const applicationActivity = applications.slice(0, 3).map((application) => {
    return `Application ${application.status.toLowerCase()} for ${application.borrower} • ${application.product} • ${application.amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`
  })

  return [...leadActivity, ...applicationActivity].slice(0, 6)
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function fetchFromCrmApi(): Promise<WorkspaceData | null> {
  if (!CRM_API_URL) {
    return null
  }

  const headers = CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : undefined

  try {
    const [leadPayload, applicationPayload] = await Promise.all([
      fetchJson<unknown>(`${CRM_API_URL}/api/leads`, { headers }),
      fetchJson<unknown>(`${CRM_API_URL}/api/applications`, { headers }),
    ])

    const leadList = Array.isArray(leadPayload)
      ? leadPayload
      : Array.isArray((leadPayload as { leads?: unknown[] }).leads)
        ? (leadPayload as { leads: unknown[] }).leads
        : []
    const applicationList = Array.isArray(applicationPayload)
      ? applicationPayload
      : Array.isArray((applicationPayload as { applications?: unknown[] }).applications)
        ? (applicationPayload as { applications: unknown[] }).applications
        : []

    const leads = leadList.map((item, index) => mapLeadRecord(item as Record<string, unknown>, index))
    const applications = applicationList.map((item, index) => mapApplicationRecord(item as Record<string, unknown>, index))

    return {
      leads,
      applications,
      crmOverview: buildOverview(leads, applications),
      recentActivity: buildRecentActivity(leads, applications),
      source: "crm-api",
    }
  } catch {
    return null
  }
}

async function fetchFromTwentyMcp(): Promise<WorkspaceData | null> {
  if (!TWENTY_MCP_URL) {
    return null
  }

  try {
    const payload = await fetchJson<{ data?: unknown[] }>(`${TWENTY_MCP_URL}/mcp/tools/search_leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ params: {} }),
    })

    const leads = Array.isArray(payload.data)
      ? payload.data.map((item, index) => mapLeadRecord(item as Record<string, unknown>, index))
      : []

    return {
      leads,
      applications: [],
      crmOverview: buildOverview(leads, []),
      recentActivity: buildRecentActivity(leads, []),
      source: "twenty-mcp",
    }
  } catch {
    return null
  }
}

async function twentyGraphQlRequest<T>(query: string): Promise<T> {
  const response = await fetch(`${TWENTY_CRM_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(TWENTY_CRM_API_KEY ? { Authorization: `Bearer ${TWENTY_CRM_API_KEY}` } : {}),
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message?: string }> }
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "GraphQL request failed")
  }

  if (!payload.data) {
    throw new Error("GraphQL request returned no data")
  }

  return payload.data
}

async function fetchFromTwentyGraphQl(): Promise<WorkspaceData | null> {
  if (!TWENTY_CRM_URL) {
    return null
  }

  const leadQueries = [
    `query { leads(limit: 50) { id name email phone status source createdAt updatedAt customFields } }`,
    `query { people(limit: 50) { id name { firstName lastName } emails phones city createdAt updatedAt } }`,
  ]
  const applicationQueries = [
    `query { mortgageLoans(limit: 50) { id name loanAmount loanType status stage updatedAt createdAt assignee { name } } }`,
    `query { opportunities(limit: 50) { id name amount status stage updatedAt createdAt assignee { name } } }`,
  ]

  let leads: LeadRecord[] = []
  for (const query of leadQueries) {
    try {
      const data = await twentyGraphQlRequest<Record<string, unknown>>(query)
      const list = Object.values(data).find((value) => Array.isArray(value))
      if (Array.isArray(list)) {
        leads = list.map((item, index) => mapLeadRecord(item as Record<string, unknown>, index))
        break
      }
    } catch {}
  }

  let applications: ApplicationRecord[] = []
  for (const query of applicationQueries) {
    try {
      const data = await twentyGraphQlRequest<Record<string, unknown>>(query)
      const list = Object.values(data).find((value) => Array.isArray(value))
      if (Array.isArray(list)) {
        applications = list.map((item, index) => mapApplicationRecord(item as Record<string, unknown>, index))
        break
      }
    } catch {}
  }

  if (!leads.length && !applications.length) {
    return null
  }

  return {
    leads,
    applications,
    crmOverview: buildOverview(leads, applications),
    recentActivity: buildRecentActivity(leads, applications),
    source: "twenty-graphql",
  }
}

export async function getCrmWorkspaceData(): Promise<WorkspaceData> {
  const crmApi = await fetchFromCrmApi()
  if (crmApi) {
    return crmApi
  }

  const twentyMcp = await fetchFromTwentyMcp()
  if (twentyMcp) {
    return twentyMcp
  }

  const twentyGraphQl = await fetchFromTwentyGraphQl()
  if (twentyGraphQl) {
    return twentyGraphQl
  }

  if (!NYRA_ENABLE_MOCKS) {
    throw new Error("CRM workspace data unavailable and NYRA_ENABLE_MOCKS is not enabled")
  }

  return {
    leads: mockLeads,
    applications: mockApplications,
    crmOverview: mockCrmOverview,
    recentActivity: buildRecentActivity(mockLeads, mockApplications),
    source: "mock",
  }
}
