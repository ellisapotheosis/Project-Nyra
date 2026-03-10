/**
 * TwentyCRM GraphQL Query Examples
 * Mortgage-specific queries for lead and quote management
 */

import { GraphQLClient } from 'graphql-request'

// Initialize client
const client = new GraphQLClient('http://localhost:3020/graphql', {
  headers: {
    'Authorization': `Bearer ${process.env.TWENTY_CRM_API_KEY}`,
    'Content-Type': 'application/json',
  }
})

// Lead Management Queries

export const GET_LEADS_WITH_MORTGAGE_DATA = `
  query GetLeads($filter: LeadFilter, $orderBy: LeadOrderBy) {
    leads(filter: $filter, orderBy: $orderBy, limit: 50) {
      id
      name
      email
      phone
      status
      source
      createdAt
      updatedAt
      customFields {
        nyraLeadScore
        nyraLeadGrade
        creditScoreRange
        loanAmount
        downPayment
        propertyType
        propertyValue
        monthlyIncome
        debtsTotal
        employmentStatus
        ratePreference
        preApprovalStatus
      }
    }
  }
`

export const GET_LEAD_DETAILS = `
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
      activities {
        id
        type
        description
        createdAt
      }
      quotes {
        id
        quoteNumber
        loanAmount
        interestRate
        monthlyPayment
        status
        expiresAt
        createdAt
      }
    }
  }
`

export const CREATE_LEAD_WITH_MORTGAGE_DATA = `
  mutation CreateLead($input: LeadCreateInput!) {
    createLead(input: $input) {
      id
      name
      email
      phone
      status
      customFields {
        nyraLeadScore
        nyraLeadGrade
        creditScoreRange
      }
    }
  }
`

export const UPDATE_LEAD_SCORE = `
  mutation UpdateLead($id: ID!, $input: LeadUpdateInput!) {
    updateLead(id: $id, input: $input) {
      id
      customFields {
        nyraLeadScore
        nyraLeadGrade
      }
    }
  }
`

// Quote Management Queries

export const GET_QUOTES_FOR_LEAD = `
  query GetQuotes($leadId: ID!) {
    quotes(filter: { leadId: $leadId }, orderBy: { createdAt: DESC }) {
      id
      quoteNumber
      leadId
      loanAmount
      interestRate
      loanTermYears
      monthlyPayment
      downPayment
      propertyValue
      ltvRatio
      status
      rateLockedUntil
      expiresAt
      createdAt
      updatedAt
      quoteDetails {
        programType
        loanType
        creditScore
        dti
        closingCosts
        cashToClose
        apr
      }
    }
  }
`

export const CREATE_QUOTE = `
  mutation CreateQuote($input: QuoteCreateInput!) {
    createQuote(input: $input) {
      id
      quoteNumber
      loanAmount
      interestRate
      monthlyPayment
      status
      expiresAt
      createdAt
    }
  }
`

export const UPDATE_QUOTE_STATUS = `
  mutation UpdateQuote($id: ID!, $input: QuoteUpdateInput!) {
    updateQuote(id: $id, input: $input) {
      id
      status
      rateLockedUntil
      updatedAt
    }
  }
`

// Activity Tracking

export const CREATE_ACTIVITY = `
  mutation CreateActivity($input: ActivityCreateInput!) {
    createActivity(input: $input) {
      id
      type
      description
      leadId
      createdAt
    }
  }
`

export const GET_ACTIVITIES_FOR_LEAD = `
  query GetActivities($leadId: ID!) {
    activities(filter: { leadId: $leadId }, orderBy: { createdAt: DESC }) {
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
`

// Dashboard Analytics

export const GET_LEAD_ANALYTICS = `
  query GetLeadAnalytics($dateRange: DateRange!) {
    leadAnalytics(dateRange: $dateRange) {
      totalLeads
      newLeads
      convertedLeads
      conversionRate
      leadsByGrade {
        grade
        count
      }
      leadsBySource {
        source
        count
      }
      averageLeadScore
      topPerformingLenders
    }
  }
`

export const GET_QUOTE_ANALYTICS = `
  query GetQuoteAnalytics($dateRange: DateRange!) {
    quoteAnalytics(dateRange: $dateRange) {
      totalQuotes
      acceptedQuotes
      expiredQuotes
      averageLoanAmount
      averageInterestRate
      conversionRate
      quotesByProgram {
        program
        count
        averageRate
      }
    }
  }
`

// Example usage functions

export async function getLeadsWithFilters(filters?: any) {
  try {
    const data = await client.request(GET_LEADS_WITH_MORTGAGE_DATA, {
      filter: filters,
      orderBy: { createdAt: 'DESC' }
    })
    return data.leads
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw error
  }
}

export async function createLeadWithMortgageData(leadData: any) {
  try {
    const input = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      customFields: {
        creditScoreRange: leadData.creditScoreRange,
        loanAmount: leadData.loanAmount,
        downPayment: leadData.downPayment,
        propertyType: leadData.propertyType,
        propertyValue: leadData.propertyValue,
        monthlyIncome: leadData.monthlyIncome,
        employmentStatus: leadData.employmentStatus,
        nyraLeadScore: calculateLeadScore(leadData),
        nyraLeadGrade: calculateLeadGrade(leadData)
      }
    }

    const data = await client.request(CREATE_LEAD_WITH_MORTGAGE_DATA, { input })
    return data.createLead
  } catch (error) {
    console.error('Error creating lead:', error)
    throw error
  }
}

export async function createQuoteForLead(leadId: string, quoteData: any) {
  try {
    const input = {
      leadId,
      quoteNumber: `Q-${Date.now()}`,
      loanAmount: quoteData.loanAmount,
      interestRate: quoteData.interestRate,
      loanTermYears: quoteData.loanTermYears || 30,
      monthlyPayment: calculateMonthlyPayment(
        quoteData.loanAmount,
        quoteData.interestRate,
        quoteData.loanTermYears || 30
      ),
      downPayment: quoteData.downPayment,
      propertyValue: quoteData.propertyValue,
      ltvRatio: ((quoteData.loanAmount / quoteData.propertyValue) * 100).toFixed(2),
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      quoteDetails: {
        programType: quoteData.programType,
        loanType: quoteData.loanType,
        creditScore: quoteData.creditScore,
        dti: quoteData.dti,
        closingCosts: quoteData.closingCosts,
        apr: quoteData.apr
      }
    }

    const data = await client.request(CREATE_QUOTE, { input })
    return data.createQuote
  } catch (error) {
    console.error('Error creating quote:', error)
    throw error
  }
}

// Utility functions

function calculateLeadScore(leadData: any): number {
  let score = 50 // Base score

  // Credit score impact
  if (leadData.creditScore >= 740) score += 20
  else if (leadData.creditScore >= 680) score += 10
  else if (leadData.creditScore >= 620) score -= 10
  else score -= 20

  // Down payment impact
  const downPaymentPercent = (leadData.downPayment / leadData.propertyValue) * 100
  if (downPaymentPercent >= 20) score += 15
  else if (downPaymentPercent >= 10) score += 5
  else score -= 5

  // Employment status
  if (leadData.employmentStatus === 'full-time') score += 10
  else if (leadData.employmentStatus === 'part-time') score += 5
  else if (leadData.employmentStatus === 'self-employed') score -= 5
  else score -= 15

  // Income to loan ratio
  const monthlyLoanPayment = calculateMonthlyPayment(
    leadData.loanAmount,
    5.5, // Estimated rate
    30
  )
  const dti = (monthlyLoanPayment / leadData.monthlyIncome) * 100
  if (dti <= 28) score += 10
  else if (dti <= 36) score += 5
  else if (dti <= 43) score -= 5
  else score -= 15

  return Math.max(0, Math.min(100, score))
}

function calculateLeadGrade(leadData: any): 'A' | 'B' | 'C' | 'D' {
  const score = calculateLeadScore(leadData)
  if (score >= 80) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const numberOfPayments = termYears * 12

  const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  return Math.round(monthlyPayment * 100) / 100
}
