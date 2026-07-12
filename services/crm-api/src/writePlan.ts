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
  getContact(id: string): Promise<Record<string, unknown> | undefined>;
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
    ? await optionalCrmWrite(() =>
        client.enrollCampaign({
          ...plan.campaignEnrollment,
          leadId: lead.id,
        })
      )
    : undefined;
  const communications = [];
  const quotes = [];

  for (const communication of plan.communicationLogs) {
    const result = await optionalCrmWrite(() =>
      client.logCommunication({
        ...communication,
        leadId: lead.id,
      })
    );
    if (result !== undefined) communications.push(result);
  }

  for (const quote of plan.quotes) {
    const result = await optionalCrmWrite(() =>
      client.createQuote({
        ...quote,
        leadId: lead.id,
      })
    );
    if (result !== undefined) quotes.push(result);
  }

  for (const event of plan.auditEvents) {
    await auditSink.log({
      ...event,
      entityId: shouldUsePersistedLeadId(event.entityId, plan.lead.id)
        ? lead.id
        : event.entityId,
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

async function optionalCrmWrite<T>(write: () => Promise<T>): Promise<T | undefined> {
  try {
    return await write();
  } catch {
    return undefined;
  }
}

function shouldUsePersistedLeadId(
  eventEntityId: string,
  plannedLeadId: string | undefined
): boolean {
  return eventEntityId === plannedLeadId || eventEntityId === "pending";
}

async function upsertLeadFromPlan(
  lead: TwentyLeadContract,
  client: CrmWritePlanClient
): Promise<CrmPlanLeadResult> {
  const dedupeKey = lead.customFields?.dedupeKey;
  let existing = lead.id ? await client.getContact(lead.id) : undefined;

  if (!existing && dedupeKey) {
    existing = await findExistingLead(client, lead, dedupeKey);
  }

  const payload = toTwentyLeadPayload(lead);

  if (existing) {
    const existingId = String(existing.id);
    const mergedPayload = mergeConsentData(payload, existing);
    const record = await client.updateContact(existingId, mergedPayload);
    return { id: existingId, source: lead.id ? "updated" : "matched", record };
  }

  const record = await client.createContact(payload);
  const id = getCreatedId(record);
  return { id, source: "created", record };
}

function mergeConsentData(
  payload: Record<string, unknown>,
  existing: Record<string, unknown>
): Record<string, unknown> {
  const existingCustomFields =
    (existing.customFields as Record<string, unknown>) ?? {};
  const payloadCustomFields =
    (payload.customFields as Record<string, unknown>) ?? {};

  // DNC is sticky if already true
  const existingDnc = Boolean(existingCustomFields.doNotContact);
  const plannedDnc = Boolean(payloadCustomFields.doNotContact);

  // Consent strength: DNC > OPTED_OUT > OPTED_IN > UNKNOWN
  const strength: Record<string, number> = {
    DO_NOT_CONTACT: 4,
    OPTED_OUT: 3,
    OPTED_IN: 2,
    UNKNOWN: 1,
  };

  const existingConsent = String(
    existingCustomFields.consentStatus ?? "UNKNOWN"
  );
  const plannedConsent = String(payloadCustomFields.consentStatus ?? "UNKNOWN");

  const finalDnc = existingDnc || plannedDnc;
  const finalConsent =
    (strength[plannedConsent] ?? 0) > (strength[existingConsent] ?? 0)
      ? plannedConsent
      : existingConsent;

  return {
    ...payload,
    customFields: {
      ...payloadCustomFields,
      doNotContact: finalDnc,
      consentStatus: finalConsent,
    },
  };
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
