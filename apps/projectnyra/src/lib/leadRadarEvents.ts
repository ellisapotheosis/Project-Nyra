export type LiveRadarChannel =
  | "lead:updates"
  | "hotlead:alerts"
  | "quote:viewed"
  | "quote:lock_expiring"
  | "campaign:reply"
  | "campaign:blocked"
  | "pipeline:milestone"
  | "service:health";

export interface LiveRadarEvent {
  type: LiveRadarChannel;
  source: string;
  timestamp: string;
  correlationId?: string;
  traceId?: string;
  state?: string;
  mode?: "live" | "mock";
  data?: Record<string, unknown>;
}

export interface RadarLead {
  id: string;
  name: string;
  action: string;
  timestamp: string;
  intensity: number;
  source: string;
  traceId?: string;
  mode: "live" | "mock";
}

export const radarChannels: LiveRadarChannel[] = [
  "lead:updates",
  "hotlead:alerts",
  "quote:viewed",
  "quote:lock_expiring",
  "campaign:reply",
  "campaign:blocked",
  "pipeline:milestone",
];

export const mockRadarLeads: RadarLead[] = [
  {
    id: "mock-quote-viewed",
    name: "Sarah J.",
    action: "Viewed quote",
    timestamp: "Mock",
    intensity: 95,
    source: "demo-seed",
    mode: "mock",
  },
  {
    id: "mock-sms-reply",
    name: "Mike D.",
    action: "Replied to SMS",
    timestamp: "Mock",
    intensity: 80,
    source: "demo-seed",
    mode: "mock",
  },
  {
    id: "mock-email-open",
    name: "Alex K.",
    action: "Opened email",
    timestamp: "Mock",
    intensity: 40,
    source: "demo-seed",
    mode: "mock",
  },
];

export function parseRadarMessage(raw: string): LiveRadarEvent | null {
  try {
    const message = JSON.parse(raw) as { type?: string; payload?: unknown };
    if (message.type !== "event" || !message.payload) {
      return null;
    }

    return normalizeRadarEvent(message.payload);
  } catch {
    return null;
  }
}

export function normalizeRadarEvent(payload: unknown): LiveRadarEvent | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const event = payload as Partial<LiveRadarEvent>;
  if (!event.type || !radarChannels.includes(event.type)) {
    return null;
  }

  return {
    type: event.type,
    source: typeof event.source === "string" ? event.source : "unknown",
    timestamp:
      typeof event.timestamp === "string"
        ? event.timestamp
        : new Date().toISOString(),
    correlationId:
      typeof event.correlationId === "string" ? event.correlationId : undefined,
    traceId: typeof event.traceId === "string" ? event.traceId : undefined,
    state: typeof event.state === "string" ? event.state : undefined,
    mode: event.mode === "mock" ? "mock" : "live",
    data:
      event.data && typeof event.data === "object"
        ? (event.data as Record<string, unknown>)
        : {},
  };
}

export function toRadarLead(event: LiveRadarEvent): RadarLead {
  const data = event.data ?? {};
  const id =
    textValue(data.leadId) ??
    textValue(data.contactId) ??
    textValue(data.quoteId) ??
    event.correlationId ??
    `${event.type}:${event.timestamp}`;

  return {
    id,
    name: displayName(data),
    action: describeAction(event),
    timestamp: formatRelativeTimestamp(event.timestamp),
    intensity: scoreIntensity(event),
    source: sourceLabel(event),
    traceId: event.traceId,
    mode: event.mode ?? "live",
  };
}

function displayName(data: Record<string, unknown>): string {
  return (
    textValue(data.borrowerName) ??
    textValue(data.leadName) ??
    textValue(data.contactName) ??
    textValue(data.name) ??
    "Unknown lead"
  );
}

function describeAction(event: LiveRadarEvent): string {
  const state = event.state ? titleCase(event.state.replace(/[_-]/g, " ")) : "";

  switch (event.type) {
    case "hotlead:alerts":
      return state ? `Hot lead: ${state}` : "Hot lead alert";
    case "quote:viewed":
      return "Viewed quote";
    case "quote:lock_expiring":
      return "Lock expiring";
    case "campaign:reply":
      return state ? `Campaign reply: ${state}` : "Campaign reply";
    case "campaign:blocked":
      return state ? `Blocked: ${state}` : "Campaign blocked";
    case "pipeline:milestone":
      return state ? `Milestone: ${state}` : "Pipeline milestone";
    case "lead:updates":
    default:
      return state ? `Lead ${state}` : "Lead update";
  }
}

function scoreIntensity(event: LiveRadarEvent): number {
  if (event.type === "hotlead:alerts") return 96;
  if (event.type === "quote:viewed") return 88;
  if (event.type === "quote:lock_expiring") return 82;
  if (event.type === "campaign:reply") return 84;
  if (event.type === "pipeline:milestone") return 72;
  if (event.type === "campaign:blocked") return 58;
  if (event.state === "created") return 68;
  return 52;
}

function sourceLabel(event: LiveRadarEvent): string {
  const source = event.data ? textValue(event.data.sourceLabel) : undefined;
  return source ?? event.source;
}

function formatRelativeTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );
  if (elapsedSeconds < 60) return "Just now";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return `${Math.floor(elapsedHours / 24)}d ago`;
}

function textValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function titleCase(value: string): string {
  return value.replace(
    /\w\S*/g,
    (word) => word[0].toUpperCase() + word.slice(1)
  );
}
