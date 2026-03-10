#!/usr/bin/env node
/**
 * TwentyCRM MCP Server
 * Model Context Protocol server for TwentyCRM integration with Claude
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { GraphQLClient } from 'graphql-request'
import winston from 'winston'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.MCP_SERVER_PORT || 3022

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Configure GraphQL client for TwentyCRM
const twentyClient = new GraphQLClient(
  process.env.TWENTY_CRM_URL + '/graphql',
  {
    headers: {
      'Authorization': `Bearer ${process.env.TWENTY_CRM_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3008'],
  credentials: true
}))
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get('User-Agent') })
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'twenty-crm-mcp-server',
    version: '1.0.0',
    uptime: process.uptime()
  })
})

// MCP Protocol endpoints
app.get('/mcp/capabilities', (req, res) => {
  res.json({
    capabilities: {
      resources: {
        "twenty://leads": {
          description: "TwentyCRM leads with mortgage data",
          methods: ["GET", "POST", "PUT"]
        },
        "twenty://quotes": {
          description: "Mortgage quotes and rate locks",
          methods: ["GET", "POST"]
        },
        "twenty://contacts": {
          description: "Contact management",
          methods: ["GET", "POST", "PUT"]
        }
      },
      tools: {
        "get_lead_details": {
          description: "Retrieve detailed lead information including mortgage data",
          parameters: {
            type: "object",
            properties: {
              leadId: { type: "string", description: "Lead ID" }
            },
            required: ["leadId"]
          }
        },
        "create_quote": {
          description: "Create a new mortgage quote",
          parameters: {
            type: "object",
            properties: {
              leadId: { type: "string", description: "Lead ID" },
              loanAmount: { type: "number", description: "Loan amount" },
              interestRate: { type: "number", description: "Interest rate" },
              loanTermYears: { type: "number", description: "Loan term in years" }
            },
            required: ["leadId", "loanAmount", "interestRate"]
          }
        },
        "search_leads": {
          description: "Search leads by criteria",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" },
              grade: { type: "string", enum: ["A", "B", "C", "D"], description: "Lead grade" },
              status: { type: "string", description: "Lead status" }
            }
          }
        }
      }
    }
  })
})

// Get lead details
app.post('/mcp/tools/get_lead_details', async (req, res) => {
  try {
    const { leadId } = req.body.params

    const query = `
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
    `

    const data = await twentyClient.request(query, { id: leadId })

    res.json({
      success: true,
      data: data.lead,
      context: `Lead details for ${data.lead?.name || 'Unknown'}`
    })
  } catch (error) {
    logger.error('Error getting lead details:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Search leads
app.post('/mcp/tools/search_leads', async (req, res) => {
  try {
    const { query, grade, status } = req.body.params || {}

    const gqlQuery = `
      query SearchLeads($filter: LeadFilter) {
        leads(filter: $filter, limit: 20) {
          id
          name
          email
          phone
          status
          source
          createdAt
          customFields
        }
      }
    `

    const filter = {}
    if (status) filter.status = status
    if (query) filter.name = { contains: query }

    const data = await twentyClient.request(gqlQuery, { filter })

    res.json({
      success: true,
      data: data.leads,
      count: data.leads.length,
      context: `Found ${data.leads.length} leads matching criteria`
    })
  } catch (error) {
    logger.error('Error searching leads:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create quote
app.post('/mcp/tools/create_quote', async (req, res) => {
  try {
    const { leadId, loanAmount, interestRate, loanTermYears = 30 } = req.body.params

    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTermYears * 12
    const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const mutation = `
      mutation CreateQuote($input: QuoteCreateInput!) {
        createQuote(input: $input) {
          id
          quoteNumber
          loanAmount
          interestRate
          monthlyPayment
          status
          createdAt
        }
      }
    `

    const input = {
      leadId,
      loanAmount,
      interestRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      loanTermYears,
      status: 'active',
      quoteNumber: `Q-${Date.now()}`
    }

    const data = await twentyClient.request(mutation, { input })

    res.json({
      success: true,
      data: data.createQuote,
      context: `Created quote ${data.createQuote.quoteNumber} for $${loanAmount.toLocaleString()}`
    })
  } catch (error) {
    logger.error('Error creating quote:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get resources
app.get('/mcp/resources/twenty\\:*', async (req, res) => {
  try {
    const resourcePath = req.path.replace('/mcp/resources/twenty:', '')

    switch (resourcePath) {
      case 'leads':
        const leadsQuery = `
          query GetLeads {
            leads(limit: 50) {
              id
              name
              email
              status
              source
              createdAt
            }
          }
        `
        const leadsData = await twentyClient.request(leadsQuery)
        res.json({
          success: true,
          resource: 'leads',
          data: leadsData.leads
        })
        break

      default:
        res.status(404).json({
          success: false,
          error: `Resource ${resourcePath} not found`
        })
    }
  } catch (error) {
    logger.error('Error getting resource:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`TwentyCRM MCP Server listening on port ${PORT}`)
  logger.info(`Health check: http://localhost:${PORT}/health`)
  logger.info(`Capabilities: http://localhost:${PORT}/mcp/capabilities`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully')
  process.exit(0)
})
