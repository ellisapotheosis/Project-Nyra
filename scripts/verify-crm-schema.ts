import { TwentyCRMClient } from '@nyra/crm-client';
import dotenv from 'dotenv';

dotenv.config();

async function verifySchema() {
  const client = new TwentyCRMClient({
    endpoint: `${process.env.TWENTY_CRM_URL}/graphql`,
    apiKey: process.env.TWENTY_CRM_API_KEY || ''
  });

  console.log('--- Twenty CRM Schema Verification ---');
  
  try {
    // Check for MortgageLead object
    const checkQuery = `
      query {
        __type(name: "MortgageLead") {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;
    
    // We use raw request because the client might not have this method yet or it might fail if type doesn't exist
    const response = await fetch(`${process.env.TWENTY_CRM_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TWENTY_CRM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: checkQuery })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ MortgageLead object not found or error querying schema.');
      console.log('Action Required: Create "MortgageLead" custom object in Twenty CRM UI.');
      return;
    }

    const fields = result.data.__type.fields.map(f => f.name);
    const requiredFields = ['personId', 'loanPurpose', 'loanAmount', 'propertyState', 'source', 'campaignStatus'];
    
    console.log('✅ MortgageLead object exists.');
    
    requiredFields.forEach(field => {
      if (fields.includes(field)) {
        console.log(`  - [OK] Field: ${field}`);
      } else {
        console.log(`  - [MISSING] Field: ${field}`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to connect to Twenty CRM:', error.message);
  }
}

verifySchema();
