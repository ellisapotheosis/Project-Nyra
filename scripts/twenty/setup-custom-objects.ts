const TWENTY_CRM_URL = process.env.TWENTY_CRM_URL || 'http://localhost:3000';
const TWENTY_CRM_API_KEY = process.env.TWENTY_CRM_API_KEY;

async function createCustomObject(schema: any) {
  console.log(`🚀 Creating custom object: ${schema.nameSingular}...`);
  
  const response = await fetch(`${TWENTY_CRM_URL.replace(/\/$/, '')}/metadata/object-definitions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TWENTY_CRM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(schema)
  });

  const result = await response.json();
  if (response.ok) {
    console.log(`✅ Successfully created ${schema.nameSingular}.`);
    return result.data;
  } else {
    if (result.errors?.[0]?.message?.includes('already exists')) {
      console.log(`ℹ️ ${schema.nameSingular} already exists.`);
    } else {
      console.error(`❌ Failed to create ${schema.nameSingular}:`, JSON.stringify(result.errors));
    }
    return null;
  }
}

async function setupSchema() {
  if (!TWENTY_CRM_API_KEY) {
    console.error('❌ TWENTY_CRM_API_KEY is not set in .env');
    process.exit(1);
  }

  // 1. MortgageLead Object
  const mortgageLead = {
    nameSingular: 'mortgageLead',
    namePlural: 'mortgageLeads',
    labelSingular: 'Mortgage Lead',
    labelPlural: 'Mortgage Leads',
    description: 'Specialized mortgage lead data',
    icon: 'IconHome',
    fields: [
      { name: 'source', label: 'Source', type: 'TEXT', defaultValue: 'ratehunter' },
      { name: 'loanPurpose', label: 'Loan Purpose', type: 'TEXT' },
      { name: 'loanAmount', label: 'Loan Amount (Micros)', type: 'NUMBER' },
      { name: 'propertyState', label: 'Property State', type: 'TEXT' },
      { name: 'creditScore', label: 'Credit Score', type: 'NUMBER' },
      { name: 'campaignStatus', label: 'Campaign Status', type: 'TEXT', defaultValue: 'PENDING' },
      { name: 'consentTimestamp', label: 'Consent Timestamp', type: 'DATE_TIME' },
      { name: 'personId', label: 'Person ID', type: 'UUID' } // Usually handled via relations, but for MVP
    ]
  };

  // 2. Campaign Object
  const campaign = {
    nameSingular: 'campaign',
    namePlural: 'campaigns',
    labelSingular: 'Campaign',
    labelPlural: 'Campaigns',
    description: 'Drip campaign templates',
    icon: 'IconSend',
    fields: [
      { name: 'name', label: 'Name', type: 'TEXT' },
      { name: 'steps', label: 'Steps (JSON)', type: 'TEXT' },
      { name: 'loanPurpose', label: 'Loan Purpose', type: 'TEXT' },
      { name: 'active', label: 'Active', type: 'BOOLEAN', defaultValue: true }
    ]
  };

  await createCustomObject(mortgageLead);
  await createCustomObject(campaign);

  console.log('🎉 Schema setup complete!');
}

setupSchema();
