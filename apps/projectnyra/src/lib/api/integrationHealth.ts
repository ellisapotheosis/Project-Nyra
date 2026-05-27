import {
  getMissingProductionServiceConfig,
  getServiceDependencyStatus,
  hasRealEnvValue,
} from "./config";

export type IntegrationHealthStatus =
  | "healthy"
  | "degraded"
  | "protected"
  | "not_configured"
  | "unreachable";

export type IntegrationHealthCheck = {
  name: string;
  ok: boolean;
  status?: number;
  error?: string;
  latencyMs?: number;
};

export type IntegrationHealthRecord = {
  id: string;
  name: string;
  category: string;
  status: IntegrationHealthStatus;
  health: number;
  lastPulse: string;
  url: string;
  urlEnv: string;
  secretEnvs: string[];
  configured: boolean;
  secretsConfigured: boolean;
  checks: IntegrationHealthCheck[];
  alert?: string;
};

export type ServiceHealthSnapshot = {
  ready: boolean;
  production: boolean;
  mocksEnabled: boolean;
  checkedAt: string;
  dependencies: ReturnType<typeof getServiceDependencyStatus>;
  missingProductionConfig: string[];
  integrations: IntegrationHealthRecord[];
};

type IntegrationDefinition = {
  id: string;
  name: string;
  category: string;
  urlEnv: string;
  fallbackUrl?: string;
  secretEnvs?: string[];
  healthPath?: string;
  protectedByAccess?: boolean;
};

type IntegrationHealthOptions = {
  env?: NodeJS.ProcessEnv;
  probe?: boolean;
  timeoutMs?: number;
  now?: Date;
};

const integrations: IntegrationDefinition[] = [
  {
    id: "twenty-crm",
    name: "Twenty CRM",
    category: "System of Record",
    urlEnv: "TWENTY_CRM_URL",
    fallbackUrl: "https://twenty.projectnyra.com",
    secretEnvs: ["TWENTY_API_KEY", "TWENTY_CRM_API_KEY"],
    healthPath: "/healthz",
  },
  {
    id: "n8n",
    name: "n8n Workflow",
    category: "Execution Engine",
    urlEnv: "N8N_BASE_URL",
    fallbackUrl: "https://n8n.projectnyra.com",
    secretEnvs: ["N8N_API_KEY", "N8N_ENCRYPTION_KEY"],
    healthPath: "/healthz",
  },
  {
    id: "litellm",
    name: "LiteLLM Proxy",
    category: "AI Gateway",
    urlEnv: "LITELLM_BASE_URL",
    fallbackUrl: "https://litellm.projectnyra.com",
    secretEnvs: ["LITELLM_MASTER_KEY"],
    healthPath: "/health",
  },
  {
    id: "nexus-router",
    name: "Nexus Router",
    category: "Singular MCP Endpoint",
    urlEnv: "NEXUS_ROUTER_URL",
    fallbackUrl: "https://nexus.projectnyra.com",
    secretEnvs: ["NEXUS_ROUTER_API_KEY"],
    healthPath: "/health",
  },
  {
    id: "openmemory",
    name: "OpenMemory MCP",
    category: "Memory Diagnostics",
    urlEnv: "NEXT_PUBLIC_OPENMEMORY_URL",
    fallbackUrl: "https://openmemory.projectnyra.com",
    secretEnvs: ["OPENMEMORY_MCP_TOKEN"],
    healthPath: "/health",
    protectedByAccess: true,
  },
  {
    id: "gastown",
    name: "Gastown",
    category: "Operator Workspace",
    urlEnv: "NEXT_PUBLIC_GASTOWN_URL",
    fallbackUrl: "https://gastown.projectnyra.com",
    secretEnvs: ["CLOUDFLARED_TUNNEL_TOKEN"],
    protectedByAccess: true,
  },
  {
    id: "letta",
    name: "Letta Memory Manager",
    category: "Agent Memory",
    urlEnv: "LETTA_BASE_URL",
    fallbackUrl: "https://letta.projectnyra.com",
    secretEnvs: ["LETTA_SERVER_PASSWORD", "LETTA_DB_PASSWORD"],
    healthPath: "/v1/health",
    protectedByAccess: true,
  },
  {
    id: "mem0",
    name: "mem0 Runtime Memory",
    category: "Assistant Memory",
    urlEnv: "MEM0_BASE_URL",
    fallbackUrl: "https://mem0.projectnyra.com",
    secretEnvs: ["MEM0_API_KEY", "QDRANT_API_KEY"],
    healthPath: "/health",
    protectedByAccess: true,
  },
  {
    id: "supabase",
    name: "Supabase Auth",
    category: "Identity",
    urlEnv: "NEXT_PUBLIC_SUPABASE_URL",
    fallbackUrl: "https://api.projectnyra.com",
    secretEnvs: ["SUPABASE_SERVICE_ROLE_KEY"],
    protectedByAccess: true,
  },
];

export async function getIntegrationHealthSnapshot(
  options: IntegrationHealthOptions = {}
): Promise<ServiceHealthSnapshot> {
  const env = options.env ?? process.env;
  const dependencies = getServiceDependencyStatus(env);
  const missingProductionConfig = getMissingProductionServiceConfig(env);
  const production = env.NODE_ENV === "production";
  const mocksEnabled = env.NYRA_ENABLE_MOCKS === "true";
  const ready =
    !production || mocksEnabled || missingProductionConfig.length === 0;

  const integrationRecords = await Promise.all(
    integrations.map((integration) =>
      getIntegrationHealth(integration, {
        env,
        probe: options.probe ?? true,
        timeoutMs: options.timeoutMs ?? 1_500,
        now: options.now,
      })
    )
  );

  return {
    ready,
    production,
    mocksEnabled,
    checkedAt: (options.now ?? new Date()).toISOString(),
    dependencies,
    missingProductionConfig,
    integrations: integrationRecords,
  };
}

async function getIntegrationHealth(
  integration: IntegrationDefinition,
  options: Required<
    Pick<IntegrationHealthOptions, "env" | "probe" | "timeoutMs">
  > &
    Pick<IntegrationHealthOptions, "now">
): Promise<IntegrationHealthRecord> {
  const configuredUrl = options.env[integration.urlEnv];
  const configured = hasRealEnvValue(configuredUrl);
  const url = configuredUrl || integration.fallbackUrl || "";
  const secretEnvs = integration.secretEnvs ?? [];
  const secretsConfigured =
    secretEnvs.length === 0 ||
    secretEnvs.some((secretEnv) => hasRealEnvValue(options.env[secretEnv]));

  if (!configured) {
    return {
      ...baseRecord(
        integration,
        url,
        configured,
        secretsConfigured,
        options.now
      ),
      status: "not_configured",
      health: 0,
      alert: `${integration.urlEnv} is not configured.`,
    };
  }

  if (integration.protectedByAccess && !integration.healthPath) {
    return {
      ...baseRecord(
        integration,
        url,
        configured,
        secretsConfigured,
        options.now
      ),
      status: secretsConfigured ? "protected" : "degraded",
      health: secretsConfigured ? 100 : 65,
      alert: secretsConfigured
        ? "Access-gated surface; no unauthenticated probe is expected."
        : "Access-gated surface is missing its expected secret.",
    };
  }

  if (!options.probe || !integration.healthPath) {
    return {
      ...baseRecord(
        integration,
        url,
        configured,
        secretsConfigured,
        options.now
      ),
      status: secretsConfigured ? "protected" : "degraded",
      health: secretsConfigured ? 100 : 70,
      alert: secretsConfigured
        ? undefined
        : "Service URL is configured, but one or more expected secrets are missing.",
    };
  }

  const check = await probeHealthUrl(
    url,
    integration.healthPath,
    options.timeoutMs
  );
  const ok = check.ok;

  if (ok && secretsConfigured) {
    return {
      ...baseRecord(
        integration,
        url,
        configured,
        secretsConfigured,
        options.now
      ),
      status: "healthy",
      health: 100,
      checks: [check],
    };
  }

  if (ok) {
    return {
      ...baseRecord(
        integration,
        url,
        configured,
        secretsConfigured,
        options.now
      ),
      status: "degraded",
      health: 80,
      checks: [check],
      alert:
        "Health probe passed, but one or more expected secrets are missing.",
    };
  }

  return {
    ...baseRecord(integration, url, configured, secretsConfigured, options.now),
    status: "unreachable",
    health: 35,
    checks: [check],
    alert: check.error ?? `Probe returned HTTP ${check.status ?? "unknown"}.`,
  };
}

function baseRecord(
  integration: IntegrationDefinition,
  url: string,
  configured: boolean,
  secretsConfigured: boolean,
  now?: Date
): Omit<IntegrationHealthRecord, "status" | "health"> {
  return {
    id: integration.id,
    name: integration.name,
    category: integration.category,
    lastPulse: configured
      ? (now ?? new Date()).toISOString()
      : "Not configured",
    url,
    urlEnv: integration.urlEnv,
    secretEnvs: integration.secretEnvs ?? [],
    configured,
    secretsConfigured,
    checks: [],
  };
}

async function probeHealthUrl(
  baseUrl: string,
  healthPath: string,
  timeoutMs: number
): Promise<IntegrationHealthCheck> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL(healthPath, baseUrl).toString(), {
      cache: "no-store",
      signal: controller.signal,
    });

    return {
      name: healthPath,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      name: healthPath,
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Health probe failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
