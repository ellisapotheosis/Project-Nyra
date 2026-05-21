import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

export const serviceName = "discord-alerts";

export const discordAlertTypes = [
  "hot_lead",
  "quote_viewed_repeatedly",
  "reply_ready",
  "lendingpad_milestone_change",
  "failed_send_provider",
  "service_down",
  "lock_expiration",
] as const;

export const discordAlertSeverities = ["info", "warning", "critical"] as const;

const alertSchema = z.object({
  type: z.enum(discordAlertTypes),
  severity: z.enum(discordAlertSeverities).default("info"),
  title: z.string().min(3).max(120),
  body: z.string().min(1).max(1200),
  source: z.string().min(1).max(80),
  correlationId: z.string().min(1),
  traceId: z.string().min(1).optional(),
  leadId: z.string().optional(),
  quoteId: z.string().optional(),
  timelineUrl: z.string().url().optional(),
  occurredAt: z.string().datetime().optional(),
  dedupeKey: z.string().min(1).optional(),
  throttleWindowSeconds: z.number().int().min(0).max(86_400).optional(),
  data: z.record(z.string(), z.unknown()).default({}),
});

export type DiscordAlertType = (typeof discordAlertTypes)[number];
export type DiscordAlertSeverity = (typeof discordAlertSeverities)[number];
export type DiscordAlertInput = z.input<typeof alertSchema>;
export type DiscordAlert = z.output<typeof alertSchema> & {
  id: string;
  occurredAt: string;
  dedupeKey: string;
};

export type DiscordAlertStatus = "SENT" | "THROTTLED" | "DISABLED" | "FAILED";

export type DiscordAlertRecord = {
  id: string;
  alert: DiscordAlert;
  status: DiscordAlertStatus;
  providerMessageId?: string;
  reason?: string;
  attemptedAt: string;
};

export type DiscordAlertAuditEvent = {
  type: "operator_alert.discord";
  service: typeof serviceName;
  alertId: string;
  alertType: DiscordAlertType;
  status: DiscordAlertStatus;
  severity: DiscordAlertSeverity;
  source: string;
  correlationId: string;
  traceId?: string;
  reason?: string;
  occurredAt: string;
};

export type DiscordWebhookClient = {
  send(alert: DiscordAlert): Promise<{ providerMessageId?: string }>;
};

export type DiscordAlertServiceOptions = {
  webhookClient?: DiscordWebhookClient;
  enabled?: boolean;
  minSeverity?: DiscordAlertSeverity;
  defaultThrottleWindowSeconds?: number;
  now?: () => Date;
  idFactory?: () => string;
};

export type DiscordAlertResult = {
  record: DiscordAlertRecord;
  auditEvent: DiscordAlertAuditEvent;
};

const severityRank: Record<DiscordAlertSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

export function redactDiscordAlertText(value: string): string {
  return value
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]")
    .replace(/\b\d{9}\b/g, "[REDACTED_ID]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(
      /\b(?:\+?1[-.\s]*)?\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4}\b/g,
      "[REDACTED_PHONE]"
    );
}

export function redactDiscordAlert(
  input: DiscordAlertInput
): DiscordAlertInput {
  return {
    ...input,
    title: redactDiscordAlertText(input.title),
    body: redactDiscordAlertText(input.body),
    data: redactAlertData(input.data ?? {}),
  };
}

function redactAlertData(
  data: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (/ssn|email|phone|dob|dateOfBirth/i.test(key)) {
        return [key, "[REDACTED]"];
      }
      if (typeof value === "string") {
        return [key, redactDiscordAlertText(value)];
      }
      return [key, value];
    })
  );
}

function buildDedupeKey(alert: z.output<typeof alertSchema>): string {
  if (alert.dedupeKey) {
    return alert.dedupeKey;
  }

  const stableParts = [
    alert.type,
    alert.source,
    alert.leadId ?? "",
    alert.quoteId ?? "",
    alert.traceId ?? "",
    alert.title,
  ].join("|");

  return createHash("sha256").update(stableParts).digest("hex").slice(0, 24);
}

function parseAlert(
  input: DiscordAlertInput,
  id: string,
  now: Date
): DiscordAlert {
  const parsed = alertSchema.parse(redactDiscordAlert(input));
  const occurredAt = parsed.occurredAt ?? now.toISOString();

  return {
    ...parsed,
    id,
    occurredAt,
    dedupeKey: buildDedupeKey(parsed),
  };
}

export class WebhookDiscordClient implements DiscordWebhookClient {
  constructor(
    private readonly webhookUrl: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async send(alert: DiscordAlert): Promise<{ providerMessageId?: string }> {
    const response = await this.fetchImpl(this.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toDiscordWebhookPayload(alert)),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook rejected alert with ${response.status}`);
    }

    return {
      providerMessageId:
        response.headers.get("x-ratelimit-bucket") ?? undefined,
    };
  }
}

export class DiscordAlertService {
  private readonly records = new Map<string, DiscordAlertRecord>();
  private readonly dedupeSentAt = new Map<string, number>();
  private readonly now: () => Date;
  private readonly idFactory: () => string;
  private readonly defaultThrottleWindowSeconds: number;
  private readonly minSeverity: DiscordAlertSeverity;
  private readonly enabled: boolean;

  constructor(private readonly options: DiscordAlertServiceOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.idFactory = options.idFactory ?? randomUUID;
    this.defaultThrottleWindowSeconds =
      options.defaultThrottleWindowSeconds ?? 300;
    this.minSeverity = options.minSeverity ?? "info";
    this.enabled = options.enabled ?? true;
  }

  async sendAlert(input: DiscordAlertInput): Promise<DiscordAlertResult> {
    const attemptedAt = this.now();
    const alert = parseAlert(input, this.idFactory(), attemptedAt);

    if (severityRank[alert.severity] < severityRank[this.minSeverity]) {
      return this.record(alert, "THROTTLED", attemptedAt, "below_min_severity");
    }

    if (!this.enabled || !this.options.webhookClient) {
      return this.record(
        alert,
        "DISABLED",
        attemptedAt,
        "webhook_not_configured"
      );
    }

    const throttleWindow =
      alert.throttleWindowSeconds ?? this.defaultThrottleWindowSeconds;
    const lastSentAt = this.dedupeSentAt.get(alert.dedupeKey);
    if (
      throttleWindow > 0 &&
      lastSentAt !== undefined &&
      attemptedAt.getTime() - lastSentAt < throttleWindow * 1000
    ) {
      return this.record(
        alert,
        "THROTTLED",
        attemptedAt,
        "duplicate_in_window"
      );
    }

    try {
      const providerResult = await this.options.webhookClient.send(alert);
      this.dedupeSentAt.set(alert.dedupeKey, attemptedAt.getTime());
      return this.record(
        alert,
        "SENT",
        attemptedAt,
        undefined,
        providerResult.providerMessageId
      );
    } catch (error) {
      return this.record(
        alert,
        "FAILED",
        attemptedAt,
        error instanceof Error ? error.message : "unknown_discord_error"
      );
    }
  }

  getStatus(id: string): DiscordAlertRecord | undefined {
    return this.records.get(id);
  }

  private record(
    alert: DiscordAlert,
    status: DiscordAlertStatus,
    attemptedAt: Date,
    reason?: string,
    providerMessageId?: string
  ): DiscordAlertResult {
    const record: DiscordAlertRecord = {
      id: alert.id,
      alert,
      status,
      providerMessageId,
      reason,
      attemptedAt: attemptedAt.toISOString(),
    };

    this.records.set(alert.id, record);

    return {
      record,
      auditEvent: {
        type: "operator_alert.discord",
        service: serviceName,
        alertId: alert.id,
        alertType: alert.type,
        status,
        severity: alert.severity,
        source: alert.source,
        correlationId: alert.correlationId,
        traceId: alert.traceId,
        reason,
        occurredAt: record.attemptedAt,
      },
    };
  }
}

export function toDiscordWebhookPayload(
  alert: DiscordAlert
): Record<string, unknown> {
  const fields = [
    { name: "Source", value: alert.source, inline: true },
    { name: "Severity", value: alert.severity, inline: true },
    { name: "Correlation", value: alert.correlationId, inline: true },
    ...(alert.traceId
      ? [{ name: "Trace", value: alert.traceId, inline: true }]
      : []),
    ...(alert.leadId
      ? [{ name: "Lead", value: alert.leadId, inline: true }]
      : []),
    ...(alert.quoteId
      ? [{ name: "Quote", value: alert.quoteId, inline: true }]
      : []),
    ...(alert.timelineUrl
      ? [{ name: "Timeline", value: alert.timelineUrl, inline: false }]
      : []),
  ];

  return {
    username: "Nyra Operator Alerts",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: alert.title,
        description: alert.body,
        color:
          alert.severity === "critical"
            ? 0xff2d75
            : alert.severity === "warning"
              ? 0xffcc00
              : 0x63f7d4,
        timestamp: alert.occurredAt,
        footer: { text: `${alert.type} | ${alert.dedupeKey}` },
        fields,
      },
    ],
  };
}

export type RestRequest = {
  method: "GET" | "POST";
  path: string;
  body?: unknown;
};

export type RestResponse = {
  status: number;
  body: unknown;
};

export function createDiscordAlertRestHandler(service: DiscordAlertService) {
  return async (input: RestRequest): Promise<RestResponse> => {
    if (input.method === "POST" && input.path === "/alerts/discord") {
      try {
        const result = await service.sendAlert(input.body as DiscordAlertInput);
        return {
          status: result.record.status === "FAILED" ? 502 : 202,
          body: result,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            error:
              error instanceof Error ? error.message : "invalid_alert_request",
          },
        };
      }
    }

    const statusMatch = input.path.match(
      /^\/alerts\/discord\/([^/]+)\/status$/
    );
    const alertId = statusMatch?.[1];
    if (input.method === "GET" && alertId) {
      const record = service.getStatus(alertId);
      return record
        ? { status: 200, body: record }
        : { status: 404, body: { error: "alert_not_found" } };
    }

    return { status: 404, body: { error: "not_found" } };
  };
}
