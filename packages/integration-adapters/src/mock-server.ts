import express from 'express';
import {
  MockTwentyClient,
  MockTwilioClient,
  MockSendGridClient,
  ClassificationService,
  MockQuoteEngine
} from './index';

const app = express();
app.use(express.json());

const crm = new MockTwentyClient();
const sms = new MockTwilioClient();
const quotes = new MockQuoteEngine();

// CRM Mock Endpoints
app.get('/crm/leads/:id', async (req, res) => {
  const lead = await crm.getLead(req.params.id);
  res.json(lead);
});

app.post('/crm/leads', async (req, res) => {
  const lead = await crm.upsertLead(req.body);
  res.json(lead);
});

// Communication Mock Endpoints
app.post('/comm/sms', async (req, res) => {
  const { to, content } = req.body;
  const result = await sms.send(to, content);
  res.json(result);
});

// Classification Endpoint
app.post('/logic/classify', (req, res) => {
  const result = ClassificationService.classify(req.body.message);
  res.json(result);
});

// Quote Endpoint
app.post('/logic/quote', async (req, res) => {
  const result = await quotes.generateQuote(req.body.lead);
  res.json(result);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

const PORT = process.env.MOCK_SERVER_PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Nyra Mock Integration Server running on http://localhost:${PORT}`);
});
