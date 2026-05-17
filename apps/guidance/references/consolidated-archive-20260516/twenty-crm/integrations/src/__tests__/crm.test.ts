import { LeadAssignmentWorkflow } from '../workflows/lead-assignment';
import { TaskReminderWorkflow } from '../workflows/task-reminders';
import { ExternalIntegrations } from '../external';

describe('Mortgage CRM Workflows and Extensibility', () => {
  let mockLead;

  beforeEach(() => {
    mockLead = {
      id: 'uuid-1234',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      loan_amount: 450000,
      lead_tier: 'hot',
      status: 'new',
      contact_count: 0,
      documents_uploaded: 0,
      rate_lock_expiration: '2027-01-01',
      last_contact_date: Date.now() - 48 * 60 * 60 * 1000 // 48 hours ago
    };
  });

  describe('Lead Assignment Workflow', () => {
    it('should assign a hot lead immediately to a top producer', async () => {
      const assignment = await LeadAssignmentWorkflow.processRule(mockLead);
      expect(assignment.assignedTo).toBe('ellis_andersen');
      expect(assignment.method).toBe('priority_routing');
    });

    it('should use round-robin for warm leads', async () => {
      mockLead.lead_tier = 'warm';
      const assignment = await LeadAssignmentWorkflow.processRule(mockLead);
      expect(assignment.assignedTo).toContain('group_loan_officers:');
      expect(assignment.method).toBe('round_robin');
    });
  });

  describe('Task Planner & Reminders', () => {
    it('should create an overdue follow-up task if last contact > 24 hours', async () => {
      const tasks = await TaskReminderWorkflow.generateAutomatedTasks(mockLead);
      const followUpTask = tasks.find(t => t.title === 'Follow up with John');
      expect(followUpTask).toBeDefined();
      expect(followUpTask.priority).toBe('high');
    });

    it('should flag rate lock expiring within 7 days', async () => {
      mockLead.rate_lock_expiration = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days
      const tasks = await TaskReminderWorkflow.generateAutomatedTasks(mockLead);
      const rateTask = tasks.find(t => t.title.includes('Rate lock expiring'));
      expect(rateTask).toBeDefined();
    });
  });

  describe('External Integrations (LOS / Assistant)', () => {
    it('should generate Nyra sync payload correctly', () => {
      const payload = ExternalIntegrations.generateNyraContext(mockLead);
      expect(payload.variables.loan_amount).toBe(450000);
      expect(payload.variables.lead_tier).toBe('hot');
      expect(payload.metadata.source).toBe('crm_sync');
    });
  });
});
