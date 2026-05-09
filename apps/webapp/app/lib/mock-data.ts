export const leads = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', value: '$450,000' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'New', value: '$320,000' },
  { id: '3', name: 'Robert Brown', email: 'robert@example.com', status: 'Pending', value: '$510,000' },
];

export const campaigns = [
  { id: '1', name: 'Purchase Follow-up', status: 'Running', enrolled: 12 },
  { id: '2', name: 'Refinance Alerts', status: 'Paused', enrolled: 8 },
  { id: '3', name: 'HELOC Outreach', status: 'Running', enrolled: 5 },
];

export const applications = [
  { id: '1', borrower: 'Alice Johnson', type: 'Conventional', stage: 'Underwriting' },
  { id: '2', borrower: 'Bob Wilson', type: 'FHA', stage: 'Application' },
];

export const crmOverview = {
  pipelineValue: '$1,280,000',
  activeLeads: 25,
  closedThisMonth: 4,
};
