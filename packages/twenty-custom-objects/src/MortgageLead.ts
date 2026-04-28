// packages/twenty-custom-objects/src/MortgageLead.ts

export const MortgageLeadDefinition = {
  nameSingular: 'mortgageLead',
  namePlural: 'mortgageLeads',
  labelSingular: 'Mortgage Lead',
  labelPlural: 'Mortgage Leads',
  description: 'Mortgage lead with loan details and campaign tracking',
  icon: 'IconHome',

  fields: [
    // === CONTACT INFO ===
    { name: 'firstName', type: 'TEXT', label: 'First Name', required: true },
    { name: 'lastName', type: 'TEXT', label: 'Last Name', required: true },
    { name: 'email', type: 'EMAIL', label: 'Email', required: true, unique: true },
    { name: 'phone', type: 'PHONE', label: 'Phone', required: true },
    { name: 'secondaryPhone', type: 'PHONE', label: 'Secondary Phone' },

    // === LEAD SOURCE ===
    {
      name: 'source',
      type: 'SELECT',
      label: 'Lead Source',
      options: [
        'LendingTree',
        'FreeRateUpdate',
        'LeadMailbox',
        'Zillow',
        'Realtor.com',
        'Website',
        'Referral',
        'Email',
        'Manual',
        'Other'
      ]
    },
    { name: 'sourceLeadId', type: 'TEXT', label: 'Source Lead ID' },
    { name: 'rawPayload', type: 'RAW_JSON', label: 'Raw Payload' },

    // === LOAN DETAILS ===
    {
      name: 'loanPurpose',
      type: 'SELECT',
      label: 'Loan Purpose',
      options: [
        'Purchase',
        'Refinance',
        'CashOut',
        'HELOC',
        'HELOAN',
        'Commercial',
        'HardMoney',
        'Construction',
        'VA',
        'FHA'
      ]
    },
    { name: 'loanAmount', type: 'CURRENCY', label: 'Loan Amount' },
    { name: 'downPayment', type: 'CURRENCY', label: 'Down Payment' },
    { name: 'propertyValue', type: 'CURRENCY', label: 'Property Value' },
    { name: 'currentMortgageBalance', type: 'CURRENCY', label: 'Current Mortgage Balance' },
    { name: 'ltv', type: 'NUMBER', label: 'LTV %', format: 'percentage' },
    { name: 'cltv', type: 'NUMBER', label: 'CLTV %', format: 'percentage' },
    { name: 'fico', type: 'NUMBER', label: 'FICO Score' },
    { name: 'annualIncome', type: 'CURRENCY', label: 'Annual Income' },
    { name: 'dti', type: 'NUMBER', label: 'DTI %', format: 'percentage' },

    // === PROPERTY INFO ===
    { name: 'propertyAddress', type: 'TEXT', label: 'Property Address' },
    { name: 'propertyCity', type: 'TEXT', label: 'City' },
    { name: 'propertyState', type: 'TEXT', label: 'State' },
    { name: 'propertyZip', type: 'TEXT', label: 'ZIP' },
    { name: 'propertyCounty', type: 'TEXT', label: 'County' },
    {
      name: 'propertyType',
      type: 'SELECT',
      label: 'Property Type',
      options: [
        'SingleFamily',
        'Condo',
        'Townhouse',
        'MultiFamily_2-4',
        'MultiFamily_5+',
        'Commercial',
        'Land',
        'Manufactured'
      ]
    },
    {
      name: 'occupancy',
      type: 'SELECT',
      label: 'Occupancy',
      options: ['Primary', 'Secondary', 'Investment']
    },

    // === CAMPAIGN STATUS ===
    {
      name: 'status',
      type: 'SELECT',
      label: 'Lead Status',
      options: [
        'New',
        'Contacted',
        'Qualified',
        'Application',
        'Processing',
        'Underwriting',
        'Approved',
        'Closed',
        'Lost',
        'DNC'
      ]
    },
    { name: 'campaignId', type: 'RELATION', label: 'Active Campaign', target: 'campaign' },
    { name: 'campaignDay', type: 'NUMBER', label: 'Campaign Day' },
    { name: 'campaignPaused', type: 'BOOLEAN', label: 'Campaign Paused', default: false },

    // === COMPLIANCE ===
    { name: 'optedOut', type: 'BOOLEAN', label: 'Opted Out', default: false },
    { name: 'dncDate', type: 'DATE_TIME', label: 'DNC Date' },
    { name: 'dncReason', type: 'TEXT', label: 'DNC Reason' },
    { name: 'consentSms', type: 'BOOLEAN', label: 'SMS Consent', default: false },
    { name: 'consentEmail', type: 'BOOLEAN', label: 'Email Consent', default: false },
    { name: 'consentCall', type: 'BOOLEAN', label: 'Call Consent', default: false },
    { name: 'tcpaTimestamp', type: 'DATE_TIME', label: 'TCPA Consent Timestamp' },
    { name: 'tcpaSource', type: 'TEXT', label: 'TCPA Consent Source' },

    // === TIMESTAMPS ===
    { name: 'receivedAt', type: 'DATE_TIME', label: 'Received At' },
    { name: 'firstContactedAt', type: 'DATE_TIME', label: 'First Contacted' },
    { name: 'lastContactedAt', type: 'DATE_TIME', label: 'Last Contacted' },
    { name: 'lastResponseAt', type: 'DATE_TIME', label: 'Last Response' },
    { name: 'nextActionAt', type: 'DATE_TIME', label: 'Next Action' },
    { name: 'convertedAt', type: 'DATE_TIME', label: 'Converted At' },

    // === ASSIGNMENT ===
    { name: 'assignedTo', type: 'TEXT', label: 'Assigned To' },
    { name: 'assignedTeam', type: 'TEXT', label: 'Assigned Team' },
  ],

  relations: [
    { name: 'quotes', type: 'ONE_TO_MANY', target: 'quote' },
    { name: 'communications', type: 'ONE_TO_MANY', target: 'communication' },
    { name: 'campaign', type: 'MANY_TO_ONE', target: 'campaign' },
    { name: 'documents', type: 'ONE_TO_MANY', target: 'document' },
  ],

  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['phone'] },
    { fields: ['status', 'campaignDay'] },
    { fields: ['source', 'receivedAt'] },
    { fields: ['assignedTo', 'status'] },
  ]
};
