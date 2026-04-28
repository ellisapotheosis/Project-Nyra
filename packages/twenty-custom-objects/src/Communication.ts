// packages/twenty-custom-objects/src/Communication.ts

export const CommunicationDefinition = {
  nameSingular: 'communication',
  namePlural: 'communications',
  labelSingular: 'Communication',
  labelPlural: 'Communications',
  description: 'All lead communications for timeline',
  icon: 'IconMessage',

  fields: [
    { name: 'leadId', type: 'RELATION', label: 'Lead', target: 'mortgageLead', required: true },

    {
      name: 'direction',
      type: 'SELECT',
      label: 'Direction',
      options: ['Outbound', 'Inbound']
    },

    {
      name: 'channel',
      type: 'SELECT',
      label: 'Channel',
      options: ['SMS', 'Email', 'Voicemail', 'Call', 'MissedCall', 'WebChat']
    },

    {
      name: 'status',
      type: 'SELECT',
      label: 'Status',
      options: ['Queued', 'Sending', 'Sent', 'Delivered', 'Read', 'Failed', 'Received', 'Answered']
    },

    // Content
    { name: 'subject', type: 'TEXT', label: 'Subject (Email)' },
    { name: 'body', type: 'TEXT', label: 'Message Body' },
    { name: 'templateId', type: 'RELATION', label: 'Template', target: 'template' },

    // Call-specific
    { name: 'callDuration', type: 'NUMBER', label: 'Call Duration (seconds)' },
    { name: 'recordingUrl', type: 'TEXT', label: 'Recording URL' },
    { name: 'voicemailUrl', type: 'TEXT', label: 'Voicemail URL' },
    { name: 'disposition', type: 'SELECT', label: 'Call Disposition',
      options: ['Answered', 'Voicemail', 'NoAnswer', 'Busy', 'Failed'] },

    // Provider info
    { name: 'provider', type: 'SELECT', label: 'Provider', options: ['Twilio', 'SendGrid', 'Internal'] },
    { name: 'providerMessageId', type: 'TEXT', label: 'Provider Message ID' },
    { name: 'providerResponse', type: 'RAW_JSON', label: 'Provider Response' },

    // Threading
    { name: 'threadKey', type: 'TEXT', label: 'Thread Key' },
    { name: 'parentId', type: 'RELATION', label: 'Parent Message', target: 'communication' },

    // Campaign link
    { name: 'campaignId', type: 'RELATION', label: 'Campaign', target: 'campaign' },
    { name: 'campaignStepId', type: 'TEXT', label: 'Campaign Step ID' },
    { name: 'campaignDay', type: 'NUMBER', label: 'Campaign Day' },

    // Timestamps
    { name: 'scheduledFor', type: 'DATE_TIME', label: 'Scheduled For' },
    { name: 'sentAt', type: 'DATE_TIME', label: 'Sent At' },
    { name: 'deliveredAt', type: 'DATE_TIME', label: 'Delivered At' },
    { name: 'readAt', type: 'DATE_TIME', label: 'Read At' },
    { name: 'receivedAt', type: 'DATE_TIME', label: 'Received At' },

    // Compliance
    { name: 'containsStopWord', type: 'BOOLEAN', label: 'Contains STOP', default: false },
    { name: 'piiRedacted', type: 'BOOLEAN', label: 'PII Redacted', default: false },
  ]
};
