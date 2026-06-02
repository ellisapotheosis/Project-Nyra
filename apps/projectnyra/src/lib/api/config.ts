export const NYRA_ENABLE_MOCKS = process.env.NYRA_ENABLE_MOCKS === "true";
export const NYRA_IS_PRODUCTION = process.env.NODE_ENV === "production";

export const serviceConfig = {
  crmApiUrl: process.env.CRM_API_URL || "",
  crmApiKey: process.env.CRM_API_KEY || "",
  campaignEngineUrl: process.env.CAMPAIGN_ENGINE_URL || "",
  quoteApiUrl: process.env.QUOTE_API_URL || "",
  quoteApiSecret: process.env.QUOTE_API_SECRET || "",
  openClawBaseUrl: process.env.OPENCLAW_PUBLIC_BASE_URL || "",
  openClawChatPath: process.env.OPENCLAW_CHAT_PATH || "/v1/chat/completions",
  openClawGatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN || "",
  openClawDefaultModel: process.env.OPENCLAW_DEFAULT_MODEL || "",
  internalProxyToken: process.env.NYRA_CHAT_INTERNAL_PROXY_TOKEN || "",
};

export type ServiceDependencyStatus = {
  service: string;
  urlEnv: string;
  secretEnv?: string;
  configured: boolean;
  secretConfigured?: boolean;
};

const serviceDependencies: Array<
  Omit<ServiceDependencyStatus, "configured" | "secretConfigured">
> = [
  { service: "crm-api", urlEnv: "CRM_API_URL", secretEnv: "CRM_API_KEY" },
  { service: "lead-ingestion", urlEnv: "LEAD_INGESTION_API_URL" },
  { service: "campaign-service", urlEnv: "CAMPAIGN_ENGINE_URL" },
  {
    service: "quote-service",
    urlEnv: "QUOTE_API_URL",
    secretEnv: "QUOTE_API_SECRET",
  },
  {
    service: "openclaw",
    urlEnv: "OPENCLAW_PUBLIC_BASE_URL",
    secretEnv: "OPENCLAW_GATEWAY_TOKEN",
  },
  {
    service: "supabase",
    urlEnv: "NEXT_PUBLIC_SUPABASE_URL",
    secretEnv: "SUPABASE_SERVICE_ROLE_KEY",
  },
];

export function getServiceDependencyStatus(
  env: NodeJS.ProcessEnv = process.env
): ServiceDependencyStatus[] {
  return serviceDependencies.map((dependency) => ({
    ...dependency,
    configured: hasRealEnvValue(env[dependency.urlEnv]),
    secretConfigured: dependency.secretEnv
      ? hasRealEnvValue(env[dependency.secretEnv])
      : undefined,
  }));
}

export function getMissingProductionServiceConfig(
  env: NodeJS.ProcessEnv = process.env
): string[] {
  return getServiceDependencyStatus(env).flatMap((dependency) => {
    const missing = [];

    if (!dependency.configured) {
      missing.push(dependency.urlEnv);
    }

    if (dependency.secretEnv && !dependency.secretConfigured) {
      missing.push(dependency.secretEnv);
    }

    return missing;
  });
}

export function serviceUnavailable(
  service: string,
  detail: string,
  status = 503
) {
  return Response.json(
    {
      error: `${service} is unavailable`,
      detail,
      mocksEnabled: NYRA_ENABLE_MOCKS,
    },
    { status }
  );
}

export function canUseMockFallback() {
  return NYRA_ENABLE_MOCKS || !NYRA_IS_PRODUCTION;
}

export function productionWriteUnavailable(
  service: string,
  detail: string,
  status = 503
) {
  return serviceUnavailable(
    service,
    `${detail}. Local mock writes are disabled in production unless NYRA_ENABLE_MOCKS=true.`,
    status
  );
}

export function productionReadUnavailable(
  service: string,
  detail: string,
  status = 503
) {
  return serviceUnavailable(
    service,
    `${detail}. Local mock reads are disabled in production unless NYRA_ENABLE_MOCKS=true.`,
    status
  );
}

export function hasRealEnvValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return !/^(replace-me|changeme|todo|tbd|example|placeholder)$/i.test(
    value.trim()
  );
}
