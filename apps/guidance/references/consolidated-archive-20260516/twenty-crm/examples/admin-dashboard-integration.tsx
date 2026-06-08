/**
 * Admin Dashboard - TwentyCRM Integration Examples
 * React components and hooks for integrating with TwentyCRM
 */

import React, { useState, useEffect, useCallback } from 'react'
import { GraphQLClient } from 'graphql-request'

// Client configuration
const twentyClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_TWENTY_CRM_URL + '/graphql',
  {
    headers: {
      'Authorization': `Bearer ${process.env.TWENTY_CRM_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
)

// Types
interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  source: string
  createdAt: string
  customFields: {
    nyraLeadScore: number
    nyraLeadGrade: 'A' | 'B' | 'C' | 'D'
    creditScoreRange: string
    loanAmount: number
    propertyValue: number
  }
}

interface Quote {
  id: string
  quoteNumber: string
  loanAmount: number
  interestRate: number
  monthlyPayment: number
  status: string
  expiresAt: string
  createdAt: string
}

// Custom Hooks

export function useLeads(filters?: any) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const query = `
        query GetLeads($filter: LeadFilter) {
          leads(filter: $filter, orderBy: { createdAt: DESC }, limit: 100) {
            id
            name
            email
            phone
            status
            source
            createdAt
            customFields {
              nyraLeadScore
              nyraLeadGrade
              creditScoreRange
              loanAmount
              propertyValue
            }
          }
        }
      `

      const data = await twentyClient.request(query, { filter: filters })
      setLeads(data.leads)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return { leads, loading, error, refetch: fetchLeads }
}

export function useQuotesForLead(leadId: string) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!leadId) return

    const fetchQuotes = async () => {
      try {
        setLoading(true)
        const query = `
          query GetQuotes($leadId: ID!) {
            quotes(filter: { leadId: $leadId }, orderBy: { createdAt: DESC }) {
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

        const data = await twentyClient.request(query, { leadId })
        setQuotes(data.quotes)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quotes')
      } finally {
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [leadId])

  return { quotes, loading, error }
}

// Components

export function LeadList() {
  const [filters, setFilters] = useState({})
  const { leads, loading, error, refetch } = useLeads(filters)

  const handleGradeFilter = (grade: string) => {
    setFilters(prev => ({
      ...prev,
      customFields: { nyraLeadGrade: grade === 'ALL' ? undefined : grade }
    }))
  }

  if (loading) return <div className="animate-pulse">Loading leads...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Leads ({leads.length})</h2>

        {/* Grade Filter */}
        <div className="flex gap-2">
          {['ALL', 'A', 'B', 'C', 'D'].map(grade => (
            <button
              key={grade}
              onClick={() => handleGradeFilter(grade)}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              {grade}
            </button>
          ))}
        </div>

        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}

export function LeadCard({ lead }: { lead: Lead }) {
  const [showQuotes, setShowQuotes] = useState(false)
  const { quotes, loading: quotesLoading } = useQuotesForLead(
    showQuotes ? lead.id : ''
  )

  const gradeColor = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-red-100 text-red-800'
  }[lead.customFields.nyraLeadGrade]

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{lead.name}</h3>
          <p className="text-sm text-gray-600">{lead.email}</p>
          <p className="text-sm text-gray-600">{lead.phone}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${gradeColor}`}>
            Grade {lead.customFields.nyraLeadGrade}
          </span>
          <span className="text-xs text-gray-500">
            Score: {lead.customFields.nyraLeadScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Loan Amount:</span>
          <span className="ml-2">${lead.customFields.loanAmount?.toLocaleString()}</span>
        </div>
        <div>
          <span className="font-medium">Property Value:</span>
          <span className="ml-2">${lead.customFields.propertyValue?.toLocaleString()}</span>
        </div>
        <div>
          <span className="font-medium">Credit Range:</span>
          <span className="ml-2">{lead.customFields.creditScoreRange}</span>
        </div>
        <div>
          <span className="font-medium">Source:</span>
          <span className="ml-2">{lead.source}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowQuotes(!showQuotes)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          {showQuotes ? 'Hide' : 'Show'} Quotes
        </button>

        <span className="text-xs text-gray-500">
          Created: {new Date(lead.createdAt).toLocaleDateString()}
        </span>
      </div>

      {showQuotes && (
        <div className="border-t pt-3">
          <h4 className="font-medium mb-2">Quotes</h4>
          {quotesLoading ? (
            <div className="text-sm text-gray-500">Loading quotes...</div>
          ) : quotes.length > 0 ? (
            <div className="space-y-2">
              {quotes.map(quote => (
                <QuoteCard key={quote.id} quote={quote} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No quotes found</div>
          )}
        </div>
      )}
    </div>
  )
}

export function QuoteCard({ quote }: { quote: Quote }) {
  const isExpired = new Date(quote.expiresAt) < new Date()

  return (
    <div className="bg-gray-50 rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{quote.quoteNumber}</span>
        <span className={`px-2 py-1 rounded text-xs ${
          isExpired ? 'bg-red-100 text-red-800' :
          quote.status === 'active' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {isExpired ? 'Expired' : quote.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="font-medium">${quote.loanAmount.toLocaleString()}</div>
          <div className="text-gray-600">Loan Amount</div>
        </div>
        <div>
          <div className="font-medium">{quote.interestRate}%</div>
          <div className="text-gray-600">Interest Rate</div>
        </div>
        <div>
          <div className="font-medium">${quote.monthlyPayment.toLocaleString()}</div>
          <div className="text-gray-600">Monthly Payment</div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Expires: {new Date(quote.expiresAt).toLocaleDateString()}
      </div>
    </div>
  )
}

// API Functions

export async function createLead(leadData: Partial<Lead>) {
  const mutation = `
    mutation CreateLead($input: LeadCreateInput!) {
      createLead(input: $input) {
        id
        name
        email
        phone
        customFields {
          nyraLeadScore
          nyraLeadGrade
        }
      }
    }
  `

  try {
    const data = await twentyClient.request(mutation, {
      input: {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source,
        customFields: leadData.customFields
      }
    })
    return data.createLead
  } catch (error) {
    console.error('Error creating lead:', error)
    throw error
  }
}

export async function updateLeadScore(leadId: string, score: number, grade: string) {
  const mutation = `
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

  try {
    const data = await twentyClient.request(mutation, {
      id: leadId,
      input: {
        customFields: {
          nyraLeadScore: score,
          nyraLeadGrade: grade
        }
      }
    })
    return data.updateLead
  } catch (error) {
    console.error('Error updating lead score:', error)
    throw error
  }
}

export async function createQuote(leadId: string, quoteData: any) {
  const mutation = `
    mutation CreateQuote($input: QuoteCreateInput!) {
      createQuote(input: $input) {
        id
        quoteNumber
        loanAmount
        interestRate
        monthlyPayment
        status
        expiresAt
      }
    }
  `

  try {
    const data = await twentyClient.request(mutation, {
      input: {
        leadId,
        ...quoteData,
        quoteNumber: `Q-${Date.now()}`,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
    return data.createQuote
  } catch (error) {
    console.error('Error creating quote:', error)
    throw error
  }
}

// Utility Components

export function TwentyCrmConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await twentyClient.request(`
          query HealthCheck {
            __schema {
              types {
                name
              }
            }
          }
        `)
        setStatus('connected')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Connection failed')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        status === 'checking' ? 'bg-yellow-400' :
        status === 'connected' ? 'bg-green-400' : 'bg-red-400'
      }`} />
      <span>
        TwentyCRM: {
          status === 'checking' ? 'Checking...' :
          status === 'connected' ? 'Connected' :
          `Error - ${error}`
        }
      </span>
    </div>
  )
}

export default {
  LeadList,
  LeadCard,
  QuoteCard,
  TwentyCrmConnectionStatus,
  useLeads,
  useQuotesForLead,
  createLead,
  updateLeadScore,
  createQuote
}
