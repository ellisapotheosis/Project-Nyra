import type {
  AuditLedgerContract,
  CrmWritePlan,
  TwentyLeadContract,
} from "@nyra/crm-types";

export type CrmPlanLeadResult = {
  id: string;
  source: "created" | "updated" | "matched";
  record: unknown;
};

export type CrmWritePlanResult = {
  lead: CrmPlanLeadResult;
  campaignEnrollment?: unknown;
  communications: unknown[];
  quotes: unknown[];
  auditEvents: AuditLedgerContract[];
};

export interface CrmWritePlanClient {
  createContact(
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
  updateContact(
    id: string,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
  searchContacts(options: {
    filter?: Record<string, unknown>;
    limit?: number;
  }): Promise<Array<Record<string, unknown>>>;
  enrollCampaign(input: Record<string, unknown>): Promise<unknown>;
  logCommunication(input: Record<string, unknown>): Promise<unknown>;
  createQuote(input: Record<string, unknown>): Promise<unknown>;
}

export interface AuditSink {
  log(event: AuditLedgerContract): Promise<void>;
}

export async function executeCrmWritePlan(
  plan: CrmWritePlan,
  client: CrmWritePlanClient,
  auditSink: AuditSink
): Promise<CrmWritePlanResult> {
  const lead = await upsertLeadFromPlan(plan.lead, client);
  const campaignEnrollment = plan.campaignEnrollment
    ? await client.enrollCampaign({
        ...plan.campaignEnrollment,
        leadId: lead.id,
      })
    : undefined;
  const communications = [];
  const quotes = [];

  for (const communication of plan.communicationLogs) {
    communications.push(
      await client.logCommunication({
        ...communication,
        leadId: lead.id,
      })
    );
  }

  for (const quote of plan.quotes) {
    quotes.push(
      await client.createQuote({
        ...quote,
        leadId: lead.id,
      })
    );
  }

  for (const event of plan.auditEvents) {
    await auditSink.log({
      ...event,
      entityId: event.entityId === plan.lead.id ? lead.id : event.entityId,
    });
  }

  return {
    lead,
    campaignEnrollment,
    communications,
    quotes,
    auditEvents: plan.auditEvents,
  };
}

async function upsertLeadFromPlan(
  lead: TwentyLeadContract,
  client: CrmWritePlanClient
): Promise<CrmPlanLeadResult> {
  const payload = toTwentyLeadPayload(lead);

  if (lead.id) {
    const record = await client.updateContact(lead.id, payload);
    return { id: lead.id, source: "updated", record };
  }

  const dedupeKey = lead.customFields?.dedupeKey;
  const existing = dedupeKey
    ? await findExistingLead(client, lead, dedupeKey)
    : undefined;

  if (existing?.id && typeof existing.id === "string") {
    const record = await client.updateContact(existing.id, payload);
    return { id: existing.id, source: "matched", record };
  }

  const record = await client.createContact(payload);
  const id = getCreatedId(record);
  return { id, source: "created", record };
}

async function findExistingLead(
  client: CrmWritePlanClient,
  lead: TwentyLeadContract,
  dedupeKey: string
) {
  const matches = await client.searchContacts({
    filter: {
      customFields: { dedupeKey },
      email: lead.email,
      phone: lead.phone,
    },
    limit: 1,
  });

  return matches[0];
}

function toTwentyLeadPayload(
  lead: TwentyLeadContract
): Record<string, unknown> {
  return {
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    customFields: {
      ...(lead.customFields ?? {}),
      externalId: lead.externalId,
      stage: lead.stage,
      consentStatus: lead.consentStatus,
      doNotContact: lead.doNotContact,
    },
  };
}

function getCreatedId(record: Record<string, unknown>): string {
  const id = record.id;

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("CRM lead create did not return an id");
  }

  return id;
}
