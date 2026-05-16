import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'
import pg from 'pg'
const { Pool } = pg
import fetch from 'node-fetch'
import winston from 'winston'
import { z } from 'zod'
import { TwentyCRMClient, type QuoteInput, type MortgageLeadInput } from '@nyra/crm-client'
import { AuditLogger, ClassificationService, TwentyIntegrationAdapter } from '@nyra/integration-adapters'

dotenv.config()

const {
  PORT = '4001',
  DATABASE_URL,
  TWENTY_CRM_URL,
  TWENTY_CRM_API_KEY,
  N8N_WEBHOOK_URL,
  QUOTE_ENGINE_URL,
  CRM_API_KEY
} = process.env

if (!DATABASE_URL) throw new Error('DATABASE_URL is required')
if (!TWENTY_CRM_URL) throw new Error('TWENTY_CRM_URL is required')
if (!TWENTY_CRM_API_KEY) throw new Error('TWENTY_CRM_API_KEY is required')

const pool = new Pool({ connectionString: DATABASE_URL })
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
})

const twentyClient = new TwentyCRMClient({
  endpoint: `${TWENTY_CRM_URL.replace(/\/$/, '')}/graphql`,
  apiKey: TWENTY_CRM_API_KEY
})

// Initialize Foundation Logic
const adapter = new TwentyIntegrationAdapter(
  `${TWENTY_CRM_URL.replace(/\/$/, '')}/graphql`,
  TWENTY_CRM_API_KEY
)
const audit = new AuditLogger(adapter)

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || '*' }))
app.use(express.json())

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

app.use((req, res, next) => {
  if (CRM_API_KEY && req.headers['x-crm-api-key'] !== CRM_API_KEY) {
    res.status(401).json({ error: 'Invalid API key' })
    return
  }
  next()
})

const quotePayloadSchema = z.object({
  loanAmount: z.number(),
  interestRate: z.number(),
  loanTermYears: z.number().optional(),
  propertyValue: z.number().optional(),
  downPayment: z.number().optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

const statusPayloadSchema = z.object({
  status: z.string(),
  notes: z.string().optional()
})

const campaignEnrollPayloadSchema = z.object({
  campaignName: z.string().min(1).default('New Lead Nurture'),
  channelPreferences: z.array(z.enum(['email', 'sms', 'voice'])).default(['email', 'sms'])
})

const campaignPausePayloadSchema = z.object({
  reason: z.string().min(1).default('manual_pause'),
  notes: z.string().optional()
})

const replyWebhookSchema = z.object({
  leadId: z.string().min(1),
  channel: z.enum(['email', 'sms', 'voice', 'webhook']).default('webhook'),
  body: z.string().min(1),
  providerMessageId: z.string().optional(),
  receivedAt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

async function getLoanIdForLead(leadId: string) {
  const result = await pool.query(
    `SELECT id FROM nyra_integration.loans WHERE twenty_lead_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [leadId]
  )
  return result.rows[0]?.id ?? null
}

async function enrollCampaign(contactLeadId: string, campaignName = 'New Lead Nurture') {
  const query = `
    INSERT INTO nyra_integration.campaign_enrollments (contact_id, campaign_name, status, channel_preferences)
    SELECT id, $2, 'active', ARRAY['email','sms']::VARCHAR[]
    FROM nyra_integration.lead_metadata
    WHERE twenty_lead_id = $1
    RETURNING *
  `
  const { rows } = await pool.query(query, [contactLeadId, campaignName])
  return rows[0]
}

async function pauseCampaignsForLead(leadId: string, _reason: string, _notes?: string) {
  const result = await pool.query(
    `UPDATE nyra_integration.campaign_enrollments
     SET status = 'paused'
     WHERE contact_id IN (
       SELECT id FROM nyra_integration.lead_metadata WHERE twenty_lead_id = $1
     )
     AND status IN ('active', 'pending')
     RETURNING *`,
    [leadId]
  )
  return result.rows
}

async function updateMortgageLeadCampaignStatus(leadId: string, campaignStatus: string) {
  return twentyClient.request<{ updateMortgageLead: any }>('updateMortgageLead', {
    id: leadId,
    input: { campaignStatus }
  })
}

function isStopIntent(message: string) {
  return /\b(STOP|UNSUBSCRIBE|REMOVE|CANCEL|OPT\s*OUT|DNC)\b/i.test(message)
}

async function fetchQuoteEngine(input: QuoteInput) {
  if (!QUOTE_ENGINE_URL) {
    const monthlyRate = input.interestRate / 100 / 12
    const months = (input.loanTermYears ?? 30) * 12
    const payment =
      (input.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    return {
      ...input,
      monthlyPayment: Math.round(payment * 100) / 100,
      scenarios: [
        {
          label: 'Primary',
          interestRate: input.interestRate,
          monthlyPayment: Math.round(payment * 100) / 100
        }
      ]
    }
  }

  const response = await fetch(`${QUOTE_ENGINE_URL.replace(/\/$/, '')}/api/quotes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    throw new Error('Quote engine returned an error')
  }

  return response.json() as Promise<any>
}

function normalizePhone(phone: string) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) return '+1' + cleaned
  return '+' + cleaned
}

function mapLoanPurpose(purpose: string) {
  const p = (purpose || '').toUpperCase()
  if (p.includes('PURCHASE')) return 'PURCHASE'
  if (p.includes('CASH')) return 'REFI_CASH'
  if (p.includes('REFI') || p.includes('RATE')) return 'REFI_RATE'
  if (p.includes('HELOC')) return 'HELOC'
  return 'PURCHASE'
}

// Canonical Lead Ingestion (PRD-001)
app.post('/api/leads', async (req, res, next) => {
  try {
    const raw = req.body

    // Normalize to E.164 and Micros (PRD-001)
    const lead = {
      firstName: raw.firstName || raw.first_name || raw.fname,
      lastName: raw.lastName || raw.last_name || raw.lname,
      email: raw.email || raw.email_address,
      phone: normalizePhone(raw.phone || raw.phone_number),
      loanPurpose: mapLoanPurpose(raw.loanPurpose || raw.loan_purpose || raw.loanType),
      loanAmount: (parseFloat(raw.loanAmount || raw.loan_amount) || 0) * 10000, // micros
      propertyValue: (parseFloat(raw.propertyValue || raw.property_value) || 0) * 10000,
      propertyState: raw.propertyState || raw.state || raw.property_state,
      creditRange: raw.creditRange || raw.credit_range,
      timeframe: raw.timeframe,
      creditScore: parseInt(raw.creditScore || raw.credit_score || raw.fico) || null,
      source: raw.source || 'ratehunter',
      consentTimestamp: new Date().toISOString()
    }

    if (!lead.firstName || !lead.lastName || (!lead.email && !lead.phone)) {
      res.status(400).json({ error: 'Missing required lead fields' })
      return
    }

    // Deduplication Logic (PRD-001)
    const existingResult = await twentyClient.searchContacts({
      filter: {
        or: [
          lead.email ? { email: { eq: lead.email } } : null,
          lead.phone ? { phoneNumber: { eq: lead.phone } } : null
        ].filter((x): x is any => x !== null)
      }
    })
    const existing = Array.isArray((existingResult as any)?.leads)
      ? (existingResult as any).leads
      : Array.isArray(existingResult)
        ? existingResult
        : []

    let personId: string
    if (existing && existing.length > 0) {
      personId = existing[0].id
      await twentyClient.updateContact(personId, {
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email || '',
        phone: lead.phone || '',
        customFields: { firstName: lead.firstName, lastName: lead.lastName }
      })
    } else {
      const contactResult = await twentyClient.createContact({
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source,
        customFields: { firstName: lead.firstName, lastName: lead.lastName }
      })
      const contact = (contactResult as any)?.createLead ?? contactResult
      personId = contact.id
    }

    // Create MortgageLead (PRD-001)
    const mortgageLeadResult = await twentyClient.createMortgageLead({
      personId,
      loanPurpose: lead.loanPurpose,
      loanAmount: lead.loanAmount,
      propertyValue: lead.propertyValue,
      propertyState: lead.propertyState || '',
      creditRange: lead.creditRange,
      timeframe: lead.timeframe,
      source: lead.source,
      campaignStatus: 'PENDING'
    } as MortgageLeadInput)
    const mortgageLead = (mortgageLeadResult as any)?.createMortgageLead ?? mortgageLeadResult

    // Log Foundation Audit
    await audit.log({
      entityType: 'MORTGAGE_LEAD',
      entityId: mortgageLead.id,
      action: 'LEAD_INGESTED',
      riskLevel: 'CRM_MUTATION',
      performer: 'SYSTEM'
    })

    // Trigger n8n Workflow
    if (N8N_WEBHOOK_URL) {
      fetch(`${N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/lead-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, mortgageLeadId: mortgageLead.id, personId })
      }).catch(err => logger.error('Failed to trigger n8n', err))
    }

    res.status(201).json({ success: true, personId, mortgageLeadId: mortgageLead.id })
  } catch (error) {
    next(error)
  }
})

// Quote Generation API (PRD-003)
app.post('/api/quotes', async (req, res, next) => {
  try {
    const request = req.body

    // 1. Validate scenario
    if (!request.leadId || !request.scenario?.loanAmount) {
      res.status(400).json({ error: 'Invalid quote request' })
      return
    }

    // 2. Delegate to Quote Engine (or internal logic)
    const options = await fetchQuoteEngine(request.scenario)

    // 3. Create Quote in CRM as PENDING (PRD-003)
    const quote = await twentyClient.createQuote({
      leadId: request.leadId,
      loanAmount: request.scenario.loanAmount * 10000, // micros
      interestRate: options[0]?.rate || 0,
      status: 'pending',
      metadata: { options, scenario: request.scenario }
    })

    res.status(201).json(quote)
  } catch (error) {
    next(error)
  }
})

app.post('/api/quotes/:id/approve', async (req, res, next) => {
  try {
    const { approvedBy } = req.body
    const quoteId = req.params.id

    const quote = await twentyClient.request<{ updateQuote: any }>('updateQuoteStatus', {
      id: quoteId,
      input: { status: 'approved', approvedBy, approvedAt: new Date().toISOString() }
    })

    res.json(quote)
  } catch (error) {
    next(error)
  }
})

app.get('/api/leads', async (_req, res, next) => {
  try {
    const leads = await twentyClient.searchMortgageLeads({}, 100);
    res.json({ leads });
  } catch (error) {
    next(error);
  }
});

app.get('/api/leads/:id', async (req, res, next) => {
  try {
    const result = await twentyClient.getMortgageLead(req.params.id)
    const lead = (result as any)?.mortgageLead ?? result
    if (!lead?.id) {
      res.status(404).json({ error: 'Lead not found' })
      return
    }

    const local = await pool.query(
      `SELECT * FROM nyra_integration.lead_metadata WHERE twenty_lead_id = $1 LIMIT 1`,
      [req.params.id]
    )

    res.json({ lead, metadata: local.rows[0] ?? null })
  } catch (error) {
    next(error)
  }
})

app.get('/api/leads/:id/conversation', async (req, res, next) => {
  try {
    const leadId = req.params.id
    const dbRes = await pool.query('SELECT id FROM nyra_integration.lead_metadata WHERE twenty_lead_id = $1', [leadId])
    const contactId = dbRes.rows[0]?.id
    if (!contactId) {
      res.status(404).json({ error: 'Lead metadata not found' })
      return
    }

    const logs = await pool.query(
      `SELECT channel, direction, content_preview, sent_at FROM nyra_integration.communication_logs WHERE contact_id = $1 ORDER BY sent_at DESC LIMIT 50`,
      [contactId]
    )

    // Foundation Intelligence: Classify the latest inbound message
    const latestInbound = logs.rows.find(l => l.direction === 'inbound')
    let classification = null
    if (latestInbound) {
      classification = ClassificationService.classify(latestInbound.content_preview)
    }

    const timeline = await twentyClient.request<{ communications: any[] }>('listCommunications', { leadId })

    res.json({ logs: logs.rows, timeline, classification })
  } catch (error) {
    next(error)
  }
})

app.post('/api/leads/:id/quote', async (req, res, next) => {
  try {
    const leadId = req.params.id
    const parsed = quotePayloadSchema.parse(req.body)
    const enriched = (await fetchQuoteEngine(parsed as any)) as any

    const quoteResult = await twentyClient.createQuote({
      leadId,
      loanAmount: enriched.loanAmount,
      interestRate: enriched.interestRate,
      loanTermYears: enriched.loanTermYears,
      downPayment: enriched.downPayment,
      propertyValue: enriched.propertyValue,
      status: 'sent',
      metadata: { scenarios: enriched.scenarios }
    })

    await pool.query(
      `INSERT INTO nyra_integration.quotes (loan_id, twenty_lead_id, scenarios, status, metadata, sent_to_borrower)
       VALUES ($1, $2, $3, 'sent', $4, true)`,
      [await getLoanIdForLead(leadId), leadId, JSON.stringify(enriched.scenarios), JSON.stringify(enriched)]
    )

    res.status(201).json({ quote: quoteResult })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/leads/:id/status', async (req, res, next) => {
  try {
    const leadId = req.params.id
    const parsed = statusPayloadSchema.parse(req.body)

    const update = await pool.query(
      `UPDATE nyra_integration.loans SET status = $1, notes = COALESCE(notes || '\n', '') || $2 WHERE twenty_lead_id = $3 RETURNING *`,
      [parsed.status, parsed.notes ?? '', leadId]
    )

    if (update.rowCount === 0) {
      res.status(404).json({ error: 'Loan not found for lead' })
      return
    }

    if (N8N_WEBHOOK_URL) {
      await fetch(`${N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/loan-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: parsed.status })
      })
    }

    res.json({ loan: update.rows[0] })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/leads/:id/campaign', async (req, res, next) => {
  try {
    const { status } = req.body
    const leadId = req.params.id

    const update = await updateMortgageLeadCampaignStatus(leadId, status)

    if (N8N_WEBHOOK_URL) {
      fetch(`${N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/campaign-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status })
      }).catch(err => logger.error('Failed to trigger n8n campaign-control', err))
    }

    res.json({ success: true, update })
  } catch (error) {
    next(error)
  }
})

app.post('/api/leads/:id/campaigns/enroll', async (req, res, next) => {
  try {
    const leadId = req.params.id
    const parsed = campaignEnrollPayloadSchema.parse(req.body)
    const enrollment = await enrollCampaign(leadId, parsed.campaignName)
    await updateMortgageLeadCampaignStatus(leadId, 'ACTIVE')

    if (N8N_WEBHOOK_URL) {
      fetch(`${N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/campaign-enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...parsed, enrollmentId: enrollment?.id })
      }).catch(err => logger.error('Failed to trigger n8n campaign-enroll', err))
    }

    res.status(201).json({ success: true, enrollment })
  } catch (error) {
    next(error)
  }
})

app.post('/api/leads/:id/campaigns/pause', async (req, res, next) => {
  try {
    const leadId = req.params.id
    const parsed = campaignPausePayloadSchema.parse(req.body)
    const paused = await pauseCampaignsForLead(leadId, parsed.reason, parsed.notes)
    await updateMortgageLeadCampaignStatus(leadId, 'PAUSED')

    if (N8N_WEBHOOK_URL) {
      fetch(`${N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/campaign-pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, ...parsed, pausedCount: paused.length })
      }).catch(err => logger.error('Failed to trigger n8n campaign-pause', err))
    }

    res.json({ success: true, paused })
  } catch (error) {
    next(error)
  }
})

app.post('/api/webhooks/reply', async (req, res, next) => {
  try {
    const parsed = replyWebhookSchema.parse(req.body)
    const stopDetected = isStopIntent(parsed.body)
    const pauseReason = stopDetected ? 'stop_detected' : 'inbound_reply'

    const contact = await pool.query(
      `SELECT id FROM nyra_integration.lead_metadata WHERE twenty_lead_id = $1 LIMIT 1`,
      [parsed.leadId]
    )
    const contactId = contact.rows[0]?.id

    if (contactId) {
      await pool.query(
        `INSERT INTO nyra_integration.communication_logs
         (contact_id, channel, direction, content_preview, sent_at)
         VALUES ($1, $2, 'inbound', $3, $4)`,
        [
          contactId,
          parsed.channel,
          parsed.body.slice(0, 500),
          parsed.receivedAt ?? new Date().toISOString()
        ]
      )
    }

    const paused = await pauseCampaignsForLead(parsed.leadId, pauseReason, parsed.body.slice(0, 250))
    await updateMortgageLeadCampaignStatus(parsed.leadId, stopDetected ? 'STOPPED' : 'PAUSED')

    await audit.log({
      entityType: 'MORTGAGE_LEAD',
      entityId: parsed.leadId,
      action: stopDetected ? 'STOP_DETECTED' : 'REPLY_PAUSED_CAMPAIGN',
      riskLevel: 'CRM_MUTATION',
      performer: 'SYSTEM'
    })

    if (N8N_WEBHOOK_URL) {
      fetch(`${N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/reply-received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, stopDetected, pausedCount: paused.length })
      }).catch(err => logger.error('Failed to trigger n8n reply-received', err))
    }

    res.json({ success: true, stopDetected, pausedCount: paused.length })
  } catch (error) {
    next(error)
  }
})

app.get('/api/dashboard/pipeline', async (_req, res, next) => {
  try {
    const query = `
      SELECT campaign_name, status, COUNT(*)::int AS total, MAX(next_touch) AS next_touch
      FROM nyra_integration.campaign_enrollments
      GROUP BY campaign_name, status
      ORDER BY campaign_name, status
    `
    const { rows } = await pool.query(query)
    res.json({ pipeline: rows })
  } catch (error) {
    next(error)
  }
})

const webhookSchema = z.object({
  leadId: z.string(),
  payload: z.record(z.string(), z.any())
})

app.post('/webhooks/twenty/contact-created', async (req, res, next) => {
  try {
    const parsed = webhookSchema.parse(req.body)
    await enrollCampaign(parsed.leadId, 'New Lead Nurture')
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

app.post('/webhooks/twenty/loan-status', async (req, res, next) => {
  try {
    const parsed = webhookSchema.parse(req.body)
    const status = parsed.payload?.status
    if (status) {
      await pool.query('UPDATE nyra_integration.loans SET status = $1 WHERE twenty_lead_id = $2', [status, parsed.leadId])
    }
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

app.post('/webhooks/twenty/contact-updated', (_req, res) => {
  res.json({ success: true })
})

app.post('/api/campaigns', async (req, res, next) => {
  try {
    const { name, steps, loanPurpose } = req.body
    const campaign = await twentyClient.request<{ createCampaign: any }>('createCampaign', {
      input: { name, steps: JSON.stringify(steps), loanPurpose, active: true }
    })
    res.status(201).json(campaign)
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns/:id', async (req, res, next) => {
  try {
    const campaign = await twentyClient.request<{ campaign: any }>('getCampaign', { id: req.params.id })
    res.json(campaign)
  } catch (error) {
    next(error)
  }
})

app.get('/api/campaigns', async (_req, res, next) => {
  try {
    const campaigns = await twentyClient.request<{ campaigns: any[] }>('getCampaigns', {})
    res.json({ campaigns })
  } catch (error) {
    next(error)
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(Number(PORT), () => {
  logger.info(`Nyra CRM API listening on http://localhost:${PORT}`)
})
