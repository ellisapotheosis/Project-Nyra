/**
 * Mock Data Factories
 * Generate mock data for testing
 */

import { randomString, randomEmail, randomPhone, createUuid, createTimestamp } from '../utils/test-helpers';

/**
 * Create mock user
 */
export function createMockUser(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    email: randomEmail(),
    name: `Test User ${randomString(4)}`,
    phone: randomPhone(),
    role: 'user',
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock lead
 */
export function createMockLead(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    name: `Test Lead ${randomString(4)}`,
    email: randomEmail(),
    phone: randomPhone(),
    loanAmount: 300000,
    loanType: 'purchase',
    propertyValue: 400000,
    creditScore: 720,
    employmentStatus: 'employed',
    annualIncome: 85000,
    downPayment: 60000,
    status: 'new',
    source: 'website',
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock mortgage rate
 */
export function createMockMortgageRate(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    lender: 'Test Lender',
    loanType: '30-year-fixed',
    rate: 6.5,
    apr: 6.75,
    points: 0,
    monthlyPayment: 1896.20,
    fees: {
      origination: 2000,
      appraisal: 500,
      title: 1200,
      total: 3700,
    },
    requirements: {
      minCreditScore: 680,
      maxLTV: 80,
      minDownPayment: 20,
    },
    updatedAt: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock campaign
 */
export function createMockCampaign(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    name: `Test Campaign ${randomString(6)}`,
    description: 'Test campaign description',
    type: 'email',
    status: 'draft',
    targetAudience: {
      minCreditScore: 650,
      maxLoanAmount: 500000,
    },
    content: {
      subject: 'Test Email Subject',
      body: 'Test email body content',
    },
    schedule: {
      startDate: createTimestamp(86400000), // Tomorrow
      endDate: createTimestamp(86400000 * 7), // Next week
    },
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
    },
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock document
 */
export function createMockDocument(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    name: `test-document-${randomString(6)}.pdf`,
    type: 'application/pdf',
    size: 1024 * 50, // 50KB
    url: `https://storage.example.com/docs/${createUuid()}.pdf`,
    leadId: createUuid(),
    category: 'income_verification',
    status: 'pending',
    uploadedAt: createTimestamp(),
    processedAt: null,
    metadata: {
      pages: 3,
      extractedText: 'Sample document text',
    },
    ...overrides,
  };
}

/**
 * Create mock MCP request
 */
export function createMockMcpRequest(overrides: Partial<any> = {}): any {
  return {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000000),
    method: 'tools/call',
    params: {
      name: 'test-tool',
      arguments: {},
    },
    ...overrides,
  };
}

/**
 * Create mock MCP response
 */
export function createMockMcpResponse(overrides: Partial<any> = {}): any {
  return {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000000),
    result: {
      content: [
        {
          type: 'text',
          text: 'Test response',
        },
      ],
    },
    ...overrides,
  };
}

/**
 * Create mock API response
 */
export function createMockApiResponse(overrides: Partial<any> = {}): any {
  return {
    status: 'success',
    data: {},
    message: 'Operation successful',
    timestamp: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock error response
 */
export function createMockErrorResponse(overrides: Partial<any> = {}): any {
  return {
    status: 'error',
    error: {
      code: 'TEST_ERROR',
      message: 'Test error message',
      details: {},
    },
    timestamp: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock JWT payload
 */
export function createMockJwtPayload(overrides: Partial<any> = {}): any {
  return {
    sub: createUuid(),
    email: randomEmail(),
    name: 'Test User',
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    ...overrides,
  };
}

/**
 * Create mock webhook payload
 */
export function createMockWebhookPayload(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    event: 'lead.created',
    timestamp: createTimestamp(),
    data: createMockLead(),
    ...overrides,
  };
}

/**
 * Create mock database row
 */
export function createMockDbRow(tableName: string, overrides: Partial<any> = {}): any {
  const baseFields = {
    id: createUuid(),
    created_at: createTimestamp(),
    updated_at: createTimestamp(),
  };

  switch (tableName) {
    case 'users':
      return { ...baseFields, ...createMockUser(), ...overrides };
    case 'leads':
      return { ...baseFields, ...createMockLead(), ...overrides };
    case 'campaigns':
      return { ...baseFields, ...createMockCampaign(), ...overrides };
    case 'documents':
      return { ...baseFields, ...createMockDocument(), ...overrides };
    default:
      return { ...baseFields, ...overrides };
  }
}

/**
 * Create bulk mock data
 */
export function createBulkMockData<T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T> | ((index: number) => Partial<T>)
): T[] {
  return Array.from({ length: count }, (_, index) => {
    const itemOverrides = typeof overrides === 'function' ? overrides(index) : overrides;
    return factory(itemOverrides);
  });
}

/**
 * Create mock pagination response
 */
export function createMockPaginationResponse(data: any[], overrides: Partial<any> = {}): any {
  return {
    data,
    pagination: {
      page: 1,
      pageSize: data.length,
      total: data.length,
      totalPages: 1,
    },
    ...overrides,
  };
}

/**
 * Create mock rate comparison
 */
export function createMockRateComparison(overrides: Partial<any> = {}): any {
  return {
    requestId: createUuid(),
    loanAmount: 300000,
    loanType: '30-year-fixed',
    creditScore: 720,
    downPayment: 60000,
    propertyValue: 400000,
    rates: createBulkMockData(createMockMortgageRate, 5),
    comparedAt: createTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock notification
 */
export function createMockNotification(overrides: Partial<any> = {}): any {
  return {
    id: createUuid(),
    type: 'email',
    recipient: randomEmail(),
    subject: 'Test Notification',
    body: 'Test notification body',
    status: 'pending',
    scheduledAt: createTimestamp(),
    sentAt: null,
    metadata: {},
    ...overrides,
  };
}
