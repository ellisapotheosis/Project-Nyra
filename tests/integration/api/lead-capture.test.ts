/**
 * Integration Tests for Lead Capture API
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Application } from 'express';
import { createMockLead } from '../../mocks/factories';
import { MockDatabase, MockEmailService } from '../../mocks/services';

describe('Lead Capture API Integration', () => {
  let app: Application;
  let mockDb: MockDatabase;
  let mockEmailService: MockEmailService;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    mockDb = new MockDatabase();
    mockEmailService = new MockEmailService();

    setupLeadCaptureRoutes(app, mockDb, mockEmailService);
  });

  beforeEach(async () => {
    await mockDb.clear('leads');
    mockEmailService.clearSentEmails();
  });

  afterAll(async () => {
    await mockDb.clear();
  });

  describe('POST /api/leads', () => {
    it('should create a new lead', async () => {
      const leadData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-0100',
        loanAmount: 300000,
        loanType: 'purchase',
      };

      const response = await request(app)
        .post('/api/leads')
        .send(leadData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('status', 'new');

      // Verify lead was saved to database
      const leads = await mockDb.select('leads');
      expect(leads).toHaveLength(1);
      expect(leads[0].email).toBe('john.doe@example.com');
    });

    it('should send confirmation email on lead creation', async () => {
      const leadData = createMockLead({
        email: 'test@example.com',
      });

      await request(app)
        .post('/api/leads')
        .send(leadData)
        .expect(201);

      const sentEmails = mockEmailService.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe('test@example.com');
      expect(sentEmails[0].subject).toContain('confirmation');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'John Doe',
        // Missing email and phone
      };

      const response = await request(app)
        .post('/api/leads')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should validate email format', async () => {
      const invalidData = createMockLead({
        email: 'invalid-email',
      });

      const response = await request(app)
        .post('/api/leads')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should validate phone format', async () => {
      const invalidData = createMockLead({
        phone: '123', // Too short
      });

      const response = await request(app)
        .post('/api/leads')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('phone');
    });

    it('should prevent duplicate leads', async () => {
      const leadData = createMockLead({
        email: 'duplicate@example.com',
      });

      // Create first lead
      await request(app)
        .post('/api/leads')
        .send(leadData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/leads')
        .send(leadData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/leads', () => {
    beforeEach(async () => {
      // Seed test data
      await mockDb.insert('leads', createMockLead({ id: 'lead-1', status: 'new' }));
      await mockDb.insert('leads', createMockLead({ id: 'lead-2', status: 'contacted' }));
      await mockDb.insert('leads', createMockLead({ id: 'lead-3', status: 'qualified' }));
    });

    it('should list all leads', async () => {
      const response = await request(app)
        .get('/api/leads')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(3);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/leads')
        .query({ page: 1, pageSize: 2 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('pageSize', 2);
      expect(response.body.pagination).toHaveProperty('total', 3);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/leads')
        .query({ status: 'contacted' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('contacted');
    });

    it('should sort by date', async () => {
      const response = await request(app)
        .get('/api/leads')
        .query({ sortBy: 'createdAt', order: 'desc' })
        .expect(200);

      const dates = response.body.data.map((l: any) => new Date(l.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should search by name or email', async () => {
      const response = await request(app)
        .get('/api/leads')
        .query({ search: 'lead-1' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/leads/:id', () => {
    beforeEach(async () => {
      await mockDb.insert('leads', createMockLead({ id: 'lead-123' }));
    });

    it('should get lead by ID', async () => {
      const response = await request(app)
        .get('/api/leads/lead-123')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'lead-123');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent lead', async () => {
      const response = await request(app)
        .get('/api/leads/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/leads/:id', () => {
    beforeEach(async () => {
      await mockDb.insert('leads', createMockLead({
        id: 'lead-123',
        status: 'new',
      }));
    });

    it('should update lead status', async () => {
      const response = await request(app)
        .put('/api/leads/lead-123')
        .send({ status: 'contacted' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'contacted');

      // Verify in database
      const leads = await mockDb.select('leads');
      const updated = leads.find(l => l.id === 'lead-123');
      expect(updated.status).toBe('contacted');
    });

    it('should update multiple fields', async () => {
      const updates = {
        status: 'qualified',
        notes: 'Called and qualified',
        assignedTo: 'agent-1',
      };

      const response = await request(app)
        .put('/api/leads/lead-123')
        .send(updates)
        .expect(200);

      expect(response.body.status).toBe('qualified');
      expect(response.body.notes).toBe('Called and qualified');
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .put('/api/leads/lead-123')
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent lead', async () => {
      await request(app)
        .put('/api/leads/nonexistent')
        .send({ status: 'contacted' })
        .expect(404);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    beforeEach(async () => {
      await mockDb.insert('leads', createMockLead({ id: 'lead-123' }));
    });

    it('should delete lead', async () => {
      await request(app)
        .delete('/api/leads/lead-123')
        .expect(204);

      // Verify deletion
      const leads = await mockDb.select('leads');
      expect(leads.find(l => l.id === 'lead-123')).toBeUndefined();
    });

    it('should return 404 for non-existent lead', async () => {
      await request(app)
        .delete('/api/leads/nonexistent')
        .expect(404);
    });
  });

  describe('POST /api/leads/:id/qualify', () => {
    beforeEach(async () => {
      await mockDb.insert('leads', createMockLead({
        id: 'lead-123',
        status: 'contacted',
        loanAmount: 300000,
        creditScore: 720,
      }));
    });

    it('should qualify eligible lead', async () => {
      const response = await request(app)
        .post('/api/leads/lead-123/qualify')
        .send({
          creditScore: 720,
          income: 85000,
          employmentStatus: 'employed',
        })
        .expect(200);

      expect(response.body).toHaveProperty('qualified', true);
      expect(response.body).toHaveProperty('status', 'qualified');
    });

    it('should reject unqualified lead', async () => {
      const response = await request(app)
        .post('/api/leads/lead-123/qualify')
        .send({
          creditScore: 580, // Too low
          income: 30000,
          employmentStatus: 'unemployed',
        })
        .expect(200);

      expect(response.body).toHaveProperty('qualified', false);
      expect(response.body).toHaveProperty('reason');
    });

    it('should send notification email on qualification', async () => {
      await request(app)
        .post('/api/leads/lead-123/qualify')
        .send({
          creditScore: 720,
          income: 85000,
          employmentStatus: 'employed',
        })
        .expect(200);

      const emails = mockEmailService.getSentEmails();
      expect(emails).toHaveLength(1);
      expect(emails[0].subject).toContain('qualified');
    });
  });
});

// Helper function to setup routes
function setupLeadCaptureRoutes(
  app: Application,
  db: MockDatabase,
  emailService: MockEmailService
): void {
  // Create lead
  app.post('/api/leads', async (req, res) => {
    const { name, email, phone, loanAmount, loanType } = req.body;

    // Validation
    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (phone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    // Check for duplicates
    const existing = await db.select('leads');
    if (existing.some(l => l.email === email)) {
      return res.status(409).json({ error: 'Lead already exists' });
    }

    // Create lead
    const lead = createMockLead({
      name,
      email,
      phone,
      loanAmount,
      loanType,
      status: 'new',
    });

    await db.insert('leads', lead);

    // Send confirmation email
    await emailService.sendEmail(
      email,
      'Lead Confirmation',
      'Thank you for your interest!'
    );

    res.status(201).json(lead);
  });

  // List leads
  app.get('/api/leads', async (req, res) => {
    const { page = 1, pageSize = 10, status, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    let leads = await db.select('leads');

    // Filter by status
    if (status) {
      leads = leads.filter(l => l.status === status);
    }

    // Search
    if (search) {
      leads = leads.filter(l =>
        l.id.includes(search as string) ||
        l.name.toLowerCase().includes((search as string).toLowerCase()) ||
        l.email.toLowerCase().includes((search as string).toLowerCase())
      );
    }

    // Sort
    leads.sort((a, b) => {
      const aVal = a[sortBy as string];
      const bVal = b[sortBy as string];
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Paginate
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedLeads = leads.slice(start, end);

    res.json({
      data: paginatedLeads,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: leads.length,
        totalPages: Math.ceil(leads.length / Number(pageSize)),
      },
    });
  });

  // Get lead by ID
  app.get('/api/leads/:id', async (req, res) => {
    const leads = await db.select('leads');
    const lead = leads.find(l => l.id === req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  });

  // Update lead
  app.put('/api/leads/:id', async (req, res) => {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const updated = await db.update('leads', req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ error: 'Lead not found' });
    }
  });

  // Delete lead
  app.delete('/api/leads/:id', async (req, res) => {
    try {
      await db.delete('leads', req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: 'Lead not found' });
    }
  });

  // Qualify lead
  app.post('/api/leads/:id/qualify', async (req, res) => {
    const { creditScore, income, employmentStatus } = req.body;

    const leads = await db.select('leads');
    const lead = leads.find(l => l.id === req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Qualification logic
    const qualified = creditScore >= 680 && income >= 50000 && employmentStatus === 'employed';

    if (qualified) {
      await db.update('leads', req.params.id, { status: 'qualified' });

      // Send notification
      await emailService.sendEmail(
        lead.email,
        'You are qualified!',
        'Congratulations on your qualification!'
      );
    }

    res.json({
      qualified,
      status: qualified ? 'qualified' : lead.status,
      reason: qualified ? null : 'Does not meet qualification criteria',
    });
  });
}
