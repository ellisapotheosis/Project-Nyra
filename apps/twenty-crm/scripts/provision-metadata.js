import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.twenty') });

const {
  TWENTY_CRM_URL = 'http://localhost:3020',
  TWENTY_CRM_API_KEY
} = process.env;

const METADATA_URL = `${TWENTY_CRM_URL}/graphql`;

async function gqlRequest(query, variables = {}) {
  const response = await fetch(METADATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_CRM_API_KEY}`
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await response.json();
  if (json.errors) {
    console.error('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    return null;
  }
  return json.data;
}

const CREATE_OBJECT = `
  mutation CreateObject($input: CreateObjectInput!) {
    createOneObject(data: $input) {
      id
      name
      labelSingular
    }
  }
`;

const CREATE_FIELD = `
  mutation CreateField($input: CreateFieldInput!) {
    createOneField(data: $input) {
      id
      name
      label
    }
  }
`;

async function provision() {
  console.log('🚀 Provisioning Twenty CRM Mortgage Metadata...');

  if (!TWENTY_CRM_API_KEY) {
    console.error('❌ TWENTY_CRM_API_KEY missing in .env.twenty');
    return;
  }

  // 1. Create Mortgage Loan Object
  console.log('📦 Creating Mortgage Loan Object...');
  const loanObj = await gqlRequest(CREATE_OBJECT, {
    input: {
      name: 'mortgageLoan',
      labelSingular: 'Mortgage Loan',
      labelPlural: 'Mortgage Loans',
      description: 'Tracks mortgage loan applications and statuses'
    }
  });

  if (loanObj) {
    const loanId = loanObj.createOneObject.id;
    console.log(`✅ Created Mortgage Loan Object (ID: ${loanId})`);

    // Add Fields to Loan
    const fields = [
      { name: 'loanAmount', label: 'Loan Amount', type: 'NUMBER' },
      { name: 'loanType', label: 'Loan Type', type: 'TEXT' },
      { name: 'interestRate', label: 'Interest Rate', type: 'NUMBER' },
      { name: 'status', label: 'Status', type: 'TEXT' },
      { name: 'termMonths', label: 'Term (Months)', type: 'NUMBER' }
    ];

    for (const field of fields) {
      await gqlRequest(CREATE_FIELD, {
        input: {
          objectMetadataId: loanId,
          name: field.name,
          label: field.label,
          type: field.type
        }
      });
      console.log(`   + Added field: ${field.label}`);
    }
  }

  // 2. Create Mortgage Quote Object
  console.log('📦 Creating Mortgage Quote Object...');
  const quoteObj = await gqlRequest(CREATE_OBJECT, {
    input: {
      name: 'mortgageQuote',
      labelSingular: 'Mortgage Quote',
      labelPlural: 'Mortgage Quotes',
      description: 'Generated quotes for mortgage scenarios'
    }
  });

  if (quoteObj) {
    const quoteId = quoteObj.createOneObject.id;
    console.log(`✅ Created Mortgage Quote Object (ID: ${quoteId})`);

    // Add Fields to Quote
    const fields = [
      { name: 'quoteNumber', label: 'Quote #', type: 'TEXT' },
      { name: 'loanAmount', label: 'Loan Amount', type: 'NUMBER' },
      { name: 'monthlyPayment', label: 'Monthly Payment', type: 'NUMBER' },
      { name: 'expiresAt', label: 'Expires At', type: 'DATE_TIME' },
      { name: 'pdfUrl', label: 'PDF URL', type: 'TEXT' }
    ];

    for (const field of fields) {
      await gqlRequest(CREATE_FIELD, {
        input: {
          objectMetadataId: quoteId,
          name: field.name,
          label: field.label,
          type: field.type
        }
      });
      console.log(`   + Added field: ${field.label}`);
    }
  }

  console.log('🎉 Provisioning Complete.');
}

provision();
