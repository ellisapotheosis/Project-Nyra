import { Lead } from './lead-assignment';

export interface Task {
  id: string;
  relatedTo: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
}

export class TaskReminderWorkflow {
  static async generateAutomatedTasks(lead: Lead): Promise<Task[]> {
    const tasks: Task[] = [];
    const now = Date.now();

    // 1. Follow up task if no contact within 24 hours
    if (lead.last_contact_date && (now - lead.last_contact_date) > 24 * 60 * 60 * 1000) {
      tasks.push({
        id: `task-fu-${lead.id}`,
        relatedTo: lead.id,
        title: `Follow up with ${lead.first_name}`,
        description: 'No contact recorded in the last 24 hours',
        dueDate: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'todo'
      });
    }

    // 2. Request missing documents after 3 days
    if (lead.documents_uploaded === 0 && lead.last_contact_date && (now - lead.last_contact_date) > 3 * 24 * 60 * 60 * 1000) {
      tasks.push({
        id: `task-doc-${lead.id}`,
        relatedTo: lead.id,
        title: `Request missing documents from ${lead.first_name}`,
        description: 'No documents uploaded 3 days after first contact.',
        dueDate: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'todo'
      });
    }

    // 3. Rate lock expiring soon (within 7 days)
    if (lead.rate_lock_expiration) {
      const lockExpiration = new Date(lead.rate_lock_expiration).getTime();
      const daysUntilExpiration = (lockExpiration - now) / (1000 * 60 * 60 * 24);
      
      if (daysUntilExpiration > 0 && daysUntilExpiration <= 7) {
        tasks.push({
          id: `task-rate-${lead.id}`,
          relatedTo: lead.id,
          title: `Rate lock expiring for ${lead.first_name}`,
          description: `Rate lock expires in ${Math.ceil(daysUntilExpiration)} days.`,
          dueDate: new Date(lockExpiration - 24 * 60 * 60 * 1000).toISOString(),
          priority: 'critical',
          status: 'todo'
        });
      }
    }

    return tasks;
  }
}
