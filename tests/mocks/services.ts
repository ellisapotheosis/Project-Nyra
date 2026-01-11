/**
 * Mock Service Implementations
 * Mock implementations of external services
 */

import { createMockMcpResponse, createMockApiResponse } from './factories';

/**
 * Mock MCP Server
 */
export class MockMcpServer {
  private handlers: Map<string, Function> = new Map();

  registerTool(name: string, handler: Function): void {
    this.handlers.set(name, handler);
  }

  async handleRequest(request: any): Promise<any> {
    const { method, params } = request;

    if (method === 'tools/call') {
      const handler = this.handlers.get(params.name);

      if (handler) {
        const result = await handler(params.arguments);
        return createMockMcpResponse({
          id: request.id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result) }],
          },
        });
      }

      throw new Error(`Tool not found: ${params.name}`);
    }

    throw new Error(`Unknown method: ${method}`);
  }
}

/**
 * Mock Database
 */
export class MockDatabase {
  private data: Map<string, any[]> = new Map();

  constructor() {
    this.data.set('users', []);
    this.data.set('leads', []);
    this.data.set('campaigns', []);
    this.data.set('documents', []);
  }

  async select(table: string): Promise<any[]> {
    return this.data.get(table) || [];
  }

  async insert(table: string, record: any): Promise<any> {
    const records = this.data.get(table) || [];
    records.push(record);
    this.data.set(table, records);
    return record;
  }

  async update(table: string, id: string, updates: any): Promise<any> {
    const records = this.data.get(table) || [];
    const index = records.findIndex((r) => r.id === id);

    if (index >= 0) {
      records[index] = { ...records[index], ...updates };
      this.data.set(table, records);
      return records[index];
    }

    throw new Error(`Record not found: ${id}`);
  }

  async delete(table: string, id: string): Promise<void> {
    const records = this.data.get(table) || [];
    const filtered = records.filter((r) => r.id !== id);
    this.data.set(table, filtered);
  }

  async clear(table?: string): Promise<void> {
    if (table) {
      this.data.set(table, []);
    } else {
      this.data.clear();
      this.data.set('users', []);
      this.data.set('leads', []);
      this.data.set('campaigns', []);
      this.data.set('documents', []);
    }
  }
}

/**
 * Mock Redis Client
 */
export class MockRedis {
  private store: Map<string, string> = new Map();
  private expirations: Map<string, number> = new Map();

  async get(key: string): Promise<string | null> {
    const expiration = this.expirations.get(key);

    if (expiration && expiration < Date.now()) {
      this.store.delete(key);
      this.expirations.delete(key);
      return null;
    }

    return this.store.get(key) || null;
  }

  async set(key: string, value: string, expiryMode?: string, time?: number): Promise<string> {
    this.store.set(key, value);

    if (expiryMode === 'EX' && time) {
      this.expirations.set(key, Date.now() + time * 1000);
    }

    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expirations.delete(key);
    return existed ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.store.has(key)) {
      this.expirations.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async flushdb(): Promise<string> {
    this.store.clear();
    this.expirations.clear();
    return 'OK';
  }

  async quit(): Promise<string> {
    return 'OK';
  }
}

/**
 * Mock HTTP Client
 */
export class MockHttpClient {
  private responses: Map<string, any> = new Map();

  mockResponse(url: string, response: any): void {
    this.responses.set(url, response);
  }

  async get(url: string, config?: any): Promise<any> {
    const response = this.responses.get(url);

    if (response) {
      return { data: response, status: 200, statusText: 'OK' };
    }

    return { data: createMockApiResponse(), status: 200, statusText: 'OK' };
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    const response = this.responses.get(url);

    if (response) {
      return { data: response, status: 201, statusText: 'Created' };
    }

    return { data: createMockApiResponse({ data }), status: 201, statusText: 'Created' };
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    return { data: createMockApiResponse({ data }), status: 200, statusText: 'OK' };
  }

  async delete(url: string, config?: any): Promise<any> {
    return { data: createMockApiResponse(), status: 204, statusText: 'No Content' };
  }

  clearMocks(): void {
    this.responses.clear();
  }
}

/**
 * Mock Email Service
 */
export class MockEmailService {
  public sentEmails: any[] = [];

  async sendEmail(to: string, subject: string, body: string, options?: any): Promise<boolean> {
    this.sentEmails.push({
      to,
      subject,
      body,
      options,
      sentAt: new Date().toISOString(),
    });

    return true;
  }

  async sendBulkEmail(recipients: string[], subject: string, body: string): Promise<number> {
    recipients.forEach((to) => {
      this.sentEmails.push({
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
      });
    });

    return recipients.length;
  }

  getSentEmails(): any[] {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

/**
 * Mock SMS Service
 */
export class MockSmsService {
  public sentMessages: any[] = [];

  async sendSms(to: string, message: string, options?: any): Promise<boolean> {
    this.sentMessages.push({
      to,
      message,
      options,
      sentAt: new Date().toISOString(),
    });

    return true;
  }

  getSentMessages(): any[] {
    return this.sentMessages;
  }

  clearSentMessages(): void {
    this.sentMessages = [];
  }
}

/**
 * Mock Storage Service
 */
export class MockStorageService {
  private files: Map<string, Buffer> = new Map();

  async upload(path: string, content: Buffer): Promise<string> {
    this.files.set(path, content);
    return `https://storage.example.com/${path}`;
  }

  async download(path: string): Promise<Buffer> {
    const file = this.files.get(path);

    if (!file) {
      throw new Error(`File not found: ${path}`);
    }

    return file;
  }

  async delete(path: string): Promise<void> {
    this.files.delete(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  clear(): void {
    this.files.clear();
  }
}

/**
 * Mock Auth Service
 */
export class MockAuthService {
  private users: Map<string, any> = new Map();
  private tokens: Map<string, any> = new Map();

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    const token = `mock-token-${Math.random().toString(36).substring(7)}`;
    this.tokens.set(token, { userId: user.id, exp: Date.now() + 3600000 });

    return { token, user };
  }

  async validateToken(token: string): Promise<any> {
    const data = this.tokens.get(token);

    if (!data) {
      throw new Error('Invalid token');
    }

    if (data.exp < Date.now()) {
      throw new Error('Token expired');
    }

    const user = this.users.get(data.userId);
    return user;
  }

  async register(email: string, password: string, name: string): Promise<any> {
    const id = Math.random().toString(36).substring(7);
    const user = { id, email, name };
    this.users.set(id, user);
    return user;
  }

  clearUsers(): void {
    this.users.clear();
    this.tokens.clear();
  }
}
