import express from 'express';
import dotenv from 'dotenv';
import { LeadIngestionPipeline } from './pipeline';
import { TwentyIntegrationAdapter, MockLettaClient } from '@nyra/integration-adapters';

dotenv.config();

const {
  PORT = '4002',
  TWENTY_CRM_URL,
  TWENTY_CRM_API_KEY
} = process.env;

// Initialize Pipeline with Real Adapter
const crm = new TwentyIntegrationAdapter(
  `${TWENTY_CRM_URL?.replace(/\/$/, '')}/graphql`,
  TWENTY_CRM_API_KEY || 'mock-key'
);

// Note: Letta remains mock for this foundation pass
const orchestrator = new MockLettaClient();
const pipeline = new LeadIngestionPipeline(crm, orchestrator);

export const app = express();
app.use(express.json());

async function handleIngest(req: express.Request, res: express.Response) {
  try {
    const result = await pipeline.ingest(req.body);
    res.status(201).json({
      success: result.success,
      leadId: result.lead.id,
      lead: result.lead,
      audit: result.audit,
    });
  } catch (error) {
    console.error('[Ingestion Server] Error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
}

/**
 * Canonical app-facing lead ingestion routes.
 */
app.post('/api/leads', handleIngest);
app.post('/api/leads/ingest', handleIngest);

/**
 * Legacy webhook entry for external form/workflow glue.
 */
app.post('/webhook/ingest', handleIngest);

app.get('/api/leads/:id', async (req, res) => {
  try {
    const lead = await crm.getLead(req.params.id);
    res.json({ lead });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Nyra Lead Ingestion Server listening on http://localhost:${PORT}`);
  });
}
