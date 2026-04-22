import fetch from 'node-fetch';
import { TwentyCRMClient } from '@nyra/crm-client';
import dotenv from 'dotenv';

dotenv.config();

const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:4001';
const CRM_API_KEY = process.env.CRM_API_KEY;
const TWENTY_CRM_URL = process.env.TWENTY_CRM_URL || 'http://localhost:3000';
const TWENTY_CRM_API_KEY = process.env.TWENTY_CRM_API_KEY;

async function smokeTest() {
  console.log('🚀 Starting Lead Lifecycle Smoke Test...');

  const client = new TwentyCRMClient({
    endpoint: `${TWENTY_CRM_URL.replace(/\/$/, '')}/graphql`,
    apiKey: TWENTY_CRM_API_KEY || ''
  });

  // 1. Ingest a Lead
  console.log('📥 1. Ingesting test lead...');
  const testLead = {
    firstName: 'Smoke',
    lastName: 'Test',
    email: `smoke.test.${Date.now()}@example.com`,
    phone: '5551234567',
    loanPurpose: 'PURCHASE',
    loanAmount: 450000,
    propertyState: 'CA',
    source: 'SMOKE_TEST'
  };

  const ingestRes = await fetch(`${CRM_API_URL}/api/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-api-key': CRM_API_KEY || ''
    },
    body: JSON.stringify(testLead)
  });

  if (!ingestRes.ok) {
    const error = await ingestRes.text();
    console.error('❌ Ingestion failed:', error);
    return;
  }

  const ingestData = await ingestRes.json();
  console.log('✅ Ingestion success:', ingestData);

  const { personId, mortgageLeadId } = ingestData;

  // 2. Verify in CRM
  console.log('🔍 2. Verifying record in Twenty CRM...');
  // Wait a moment for n8n/async processes if any
  await new Promise(r => setTimeout(r, 2000));

  try {
    const lead = await client.getMortgageLead(mortgageLeadId);
    if (lead) {
      console.log('✅ MortgageLead found in CRM:', lead.id);
      console.log('📊 Current Status:', lead.campaignStatus);
    } else {
      console.error('❌ MortgageLead NOT found in CRM!');
    }

    const person = await client.request<{ person: any }>('getLead', { id: personId }); // getLead is used for Person in the client currently
    if (person) {
      console.log('✅ Person found in CRM:', person.person.id);
    }
  } catch (error) {
    console.error('❌ CRM Verification failed:', error.message);
  }

  // 3. Simulate Response (Compliance Check)
  console.log('💬 3. Simulating lead response (STOP keyword)...');
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';
  
  const responseRes = await fetch(`${n8nWebhookUrl.replace(/\/$/, '')}/webhook/twilio-response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      From: '5551234567',
      Body: 'STOP',
      SmsSid: 'SM123'
    })
  });

  if (responseRes.ok) {
    console.log('✅ Response webhook triggered.');
    // Wait for n8n to process
    await new Promise(r => setTimeout(r, 3000));
    
    const updatedLead = await client.getMortgageLead(mortgageLeadId);
    console.log('📊 Updated Status after STOP:', updatedLead?.campaignStatus);
    if (updatedLead?.campaignStatus === 'OPTED_OUT') {
      console.log('🎉 Smoke Test PASSED: Full lifecycle validated!');
    } else {
      console.warn('⚠️ Campaign status not updated. Is n8n running and workflow active?');
    }
  } else {
    console.error('❌ Failed to trigger response webhook. Check N8N_WEBHOOK_URL.');
  }
}

smokeTest();
