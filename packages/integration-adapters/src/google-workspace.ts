import type { IntegrationHealth } from "./index";

export interface WorkspaceCalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendeeEmails: string[];
  leadId?: string;
}

export interface WorkspaceEmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;
  leadId?: string;
}

export interface IGoogleWorkspaceClient {
  createCalendarEvent(
    input: Omit<WorkspaceCalendarEvent, "id">
  ): Promise<WorkspaceCalendarEvent>;
  createEmailDraft(input: Omit<WorkspaceEmailDraft, "id">): Promise<WorkspaceEmailDraft>;
  checkHealth(): Promise<IntegrationHealth>;
}

export class MockGoogleWorkspaceClient implements IGoogleWorkspaceClient {
  readonly events: WorkspaceCalendarEvent[] = [];
  readonly drafts: WorkspaceEmailDraft[] = [];

  async createCalendarEvent(
    input: Omit<WorkspaceCalendarEvent, "id">
  ): Promise<WorkspaceCalendarEvent> {
    const event = { ...input, id: `mock-gcal-${this.events.length + 1}` };
    this.events.push(event);
    return event;
  }

  async createEmailDraft(input: Omit<WorkspaceEmailDraft, "id">): Promise<WorkspaceEmailDraft> {
    const draft = { ...input, id: `mock-gmail-${this.drafts.length + 1}` };
    this.drafts.push(draft);
    return draft;
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY", message: "Mock Google Workspace adapter ready" };
  }
}
