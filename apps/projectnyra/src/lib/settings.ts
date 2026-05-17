import { z } from "zod";

const enabledString = z.enum(["enabled", "disabled"]);

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
});

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  serverId: z.string(),
  groupId: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  readOnly: z.boolean(),
  riskLevel: z.enum(["low", "medium", "high"]),
});

export const serverSchema = z.object({
  id: z.string(),
  name: z.string(),
  groupId: z.string(),
  transport: z.enum(["streamable-http", "sse", "stdio"]),
  endpoint: z.string(),
  enabled: z.boolean(),
  authMode: z.enum(["none", "bearer", "env"]),
  secretRef: z.string(),
  timeoutSec: z.number().int().min(1).max(300),
  rateLimitRpm: z.number().int().min(0).max(100000),
  tlsVerify: z.boolean(),
});

export const llmProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  protocol: z.enum(["openai", "anthropic", "google", "bedrock", "ollama"]),
  baseUrl: z.string(),
  models: z.string(),
  enabled: z.boolean(),
  forwardToken: z.boolean(),
  rateLimitRpm: z.number().int().min(0).max(100000),
  weight: z.number().int().min(0).max(100),
});

export const envVarSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  required: z.boolean(),
  enabled: z.boolean(),
  valueMode: z.enum(["literal", "secret-ref", "runtime"]),
  value: z.string(),
});

export const nexusUiSettingsSchema = z.object({
  version: z.literal(1),
  nexus: z.object({
    baseUrl: z.string(),
    mcpPath: z.string(),
    healthPath: z.string(),
    startupTimeoutSec: z.number().int().min(1).max(300),
    configApplyEnabled: z.boolean(),
    toolSearch: z.object({
      enabled: z.boolean(),
      fuzzyMatch: z.boolean(),
      maxResults: z.number().int().min(1).max(100),
      rankingStrategy: z.enum(["exact-first", "semantic", "hybrid"]),
    }),
  }),
  groups: z.array(groupSchema),
  servers: z.array(serverSchema),
  tools: z.array(toolSchema),
  routing: z.object({
    enabled: z.boolean(),
    strategy: z.enum(["balanced", "latency", "cost", "privacy", "fallback"]),
    defaultModel: z.string(),
    fallbackModel: z.string(),
    privacyMode: z.boolean(),
    tokenForwarding: z.boolean(),
    requireExplicitModelAllowlist: z.boolean(),
  }),
  llmProviders: z.array(llmProviderSchema),
  liteLLM: z.object({
    enabled: z.boolean(),
    baseUrl: z.string(),
    virtualKeyMode: z.boolean(),
    budgetAlerts: z.boolean(),
    cache: z.boolean(),
    retries: z.boolean(),
    fallbacks: z.boolean(),
    guardrails: z.boolean(),
    modelGroups: z.string(),
  }),
  environment: z.array(envVarSchema),
});

export type NexusUiSettings = z.infer<typeof nexusUiSettingsSchema>;

export const defaultSettings: NexusUiSettings = {
  version: 1,
  nexus: {
    baseUrl: "http://127.0.0.1:6000",
    mcpPath: "/mcp",
    healthPath: "/health",
    startupTimeoutSec: 60,
    configApplyEnabled: false,
    toolSearch: {
      enabled: true,
      fuzzyMatch: true,
      maxResults: 20,
      rankingStrategy: "hybrid",
    },
  },
  groups: [
    {
      id: "code-intelligence",
      name: "Code Intelligence",
      description:
        "Search, symbol lookup, repository inspection, and Serena-backed code navigation.",
      enabled: true,
    },
    {
      id: "source-control",
      name: "Source Control",
      description:
        "GitHub, Gitea, issues, pull requests, branches, and repository metadata.",
      enabled: true,
    },
    {
      id: "memory",
      name: "Memory",
      description:
        "Mem0, OpenMemory, Letta, and graph/vector-backed cross-agent context tools.",
      enabled: true,
    },
    {
      id: "workflow",
      name: "Workflow",
      description: "n8n, Activepieces, and internal workflow execution tools.",
      enabled: false,
    },
    {
      id: "crm",
      name: "CRM",
      description:
        "Twenty CRM read-only tools and assistant-safe CRM service boundaries.",
      enabled: false,
    },
    {
      id: "models",
      name: "Model Providers",
      description:
        "LiteLLM, local vLLM workers, Ollama, and cloud model provider routing.",
      enabled: true,
    },
  ],
  servers: [
    {
      id: "github",
      name: "GitHub MCP",
      groupId: "source-control",
      transport: "streamable-http",
      endpoint: "https://api.githubcopilot.com/mcp/",
      enabled: true,
      authMode: "env",
      secretRef: "GITHUB_TOKEN",
      timeoutSec: 30,
      rateLimitRpm: 300,
      tlsVerify: true,
    },
    {
      id: "serena",
      name: "Serena",
      groupId: "code-intelligence",
      transport: "stdio",
      endpoint: "serena start-mcp-server --context codex",
      enabled: true,
      authMode: "none",
      secretRef: "",
      timeoutSec: 60,
      rateLimitRpm: 0,
      tlsVerify: true,
    },
    {
      id: "openmemory",
      name: "OpenMemory MCP",
      groupId: "memory",
      transport: "streamable-http",
      endpoint: "http://oracle-vps:8765/mcp",
      enabled: false,
      authMode: "env",
      secretRef: "OPENMEMORY_TOKEN",
      timeoutSec: 30,
      rateLimitRpm: 120,
      tlsVerify: false,
    },
  ],
  tools: [
    {
      id: "github.search_code",
      name: "Search Code",
      serverId: "github",
      groupId: "source-control",
      description: "Search repository code through GitHub-backed MCP tools.",
      enabled: true,
      readOnly: true,
      riskLevel: "low",
    },
    {
      id: "github.create_issue",
      name: "Create Issue",
      serverId: "github",
      groupId: "source-control",
      description:
        "Create tracked GitHub issues for bugs, plans, and follow-up work.",
      enabled: true,
      readOnly: false,
      riskLevel: "medium",
    },
    {
      id: "serena.find_symbol",
      name: "Find Symbol",
      serverId: "serena",
      groupId: "code-intelligence",
      description:
        "Locate functions, classes, and references in local workspaces.",
      enabled: true,
      readOnly: true,
      riskLevel: "low",
    },
    {
      id: "memory.search",
      name: "Memory Search",
      serverId: "openmemory",
      groupId: "memory",
      description:
        "Search shared long-term assistant memory through the memory plane.",
      enabled: false,
      readOnly: true,
      riskLevel: "medium",
    },
    {
      id: "crm.lookup_contact",
      name: "CRM Lookup",
      serverId: "twenty-crm",
      groupId: "crm",
      description:
        "Read contact and loan context through assistant-safe service boundaries.",
      enabled: false,
      readOnly: true,
      riskLevel: "medium",
    },
  ],
  routing: {
    enabled: true,
    strategy: "balanced",
    defaultModel: "nyra-coding-primary",
    fallbackModel: "nyra-local-private",
    privacyMode: true,
    tokenForwarding: false,
    requireExplicitModelAllowlist: true,
  },
  llmProviders: [
    {
      id: "litellm",
      name: "LiteLLM Proxy",
      protocol: "openai",
      baseUrl: "http://127.0.0.1:4000",
      models: "nyra-coding-primary,nyra-local-private,nyra-fast-utility",
      enabled: true,
      forwardToken: false,
      rateLimitRpm: 600,
      weight: 80,
    },
    {
      id: "vllm-5090",
      name: "worker-rtx5090 vLLM",
      protocol: "openai",
      baseUrl: "http://worker-rtx5090.trex-fiordland.ts.net:8000/v1",
      models: "local-heavy",
      enabled: true,
      forwardToken: false,
      rateLimitRpm: 120,
      weight: 60,
    },
    {
      id: "ollama-3060",
      name: "worker-rtx3060 Ollama",
      protocol: "ollama",
      baseUrl: "http://worker-rtx3060.trex-fiordland.ts.net:11434",
      models: "utility-small",
      enabled: false,
      forwardToken: false,
      rateLimitRpm: 120,
      weight: 20,
    },
  ],
  liteLLM: {
    enabled: true,
    baseUrl: "http://127.0.0.1:4000",
    virtualKeyMode: true,
    budgetAlerts: true,
    cache: true,
    retries: true,
    fallbacks: true,
    guardrails: false,
    modelGroups: "coding,local-private,utility",
  },
  environment: [
    {
      key: "NEXUS_BASE_URL",
      label: "Nexus base URL",
      description: "Base URL used by this UI and agents to reach Nexus Router.",
      required: true,
      enabled: true,
      valueMode: "literal",
      value: "http://127.0.0.1:6000",
    },
    {
      key: "NEXUS_CONFIG_PATH",
      label: "Nexus config path",
      description:
        "Runtime config mounted into the Nexus container or process.",
      required: true,
      enabled: true,
      valueMode: "literal",
      value: "/etc/nexus/nexus.toml",
    },
    {
      key: "NEXUS_LOG",
      label: "Nexus log level",
      description: "Log verbosity for Nexus startup and router diagnostics.",
      required: false,
      enabled: true,
      valueMode: "literal",
      value: "info",
    },
    {
      key: "NEXUS_LOG_STYLE",
      label: "Nexus log style",
      description:
        "Log output mode for service logs. Keep structured in automation.",
      required: false,
      enabled: true,
      valueMode: "literal",
      value: "json",
    },
    {
      key: "LITELLM_BASE_URL",
      label: "LiteLLM base URL",
      description:
        "LiteLLM proxy URL used for model and virtual key management.",
      required: false,
      enabled: true,
      valueMode: "literal",
      value: "http://127.0.0.1:4000",
    },
    {
      key: "LITELLM_MASTER_KEY",
      label: "LiteLLM master key",
      description:
        "Secret reference only. Never store the key value in this UI settings file.",
      required: false,
      enabled: false,
      valueMode: "secret-ref",
      value: "LITELLM_MASTER_KEY",
    },
    {
      key: "GITHUB_TOKEN",
      label: "GitHub token",
      description: "Secret reference used by the GitHub downstream MCP server.",
      required: false,
      enabled: true,
      valueMode: "secret-ref",
      value: "GITHUB_TOKEN",
    },
    {
      key: "ANTHROPIC_API_KEY",
      label: "Anthropic API key",
      description:
        "Secret reference for cloud Claude routing through LiteLLM or Nexus LLM providers.",
      required: false,
      enabled: false,
      valueMode: "secret-ref",
      value: "ANTHROPIC_API_KEY",
    },
    {
      key: "OPENAI_API_KEY",
      label: "OpenAI API key",
      description: "Secret reference for OpenAI-compatible cloud routing.",
      required: false,
      enabled: false,
      valueMode: "secret-ref",
      value: "OPENAI_API_KEY",
    },
    {
      key: "GOOGLE_API_KEY",
      label: "Google API key",
      description: "Secret reference for Gemini routing where configured.",
      required: false,
      enabled: false,
      valueMode: "secret-ref",
      value: "GOOGLE_API_KEY",
    },
  ],
};

function bool(value: boolean) {
  return value ? "true" : "false";
}

function quote(value: string) {
  return JSON.stringify(value);
}

export function generateNexusToml(settings: NexusUiSettings) {
  const activeServers = settings.servers.filter((server) => {
    const group = settings.groups.find(
      (candidate) => candidate.id === server.groupId
    );

    return server.enabled && group?.enabled;
  });

  const activeProviders = settings.llmProviders.filter(
    (provider) => provider.enabled
  );
  const lines = [
    "# Generated by apps/nexusUI. Review before mounting into a Nexus container.",
    "# Secrets are referenced by env var name only and are not serialized here.",
    "",
    "[server]",
    'listen_address = "0.0.0.0:3000"',
    `health_path = ${quote(settings.nexus.healthPath)}`,
    "",
    "[mcp]",
    `path = ${quote(settings.nexus.mcpPath)}`,
    "",
  ];

  for (const server of activeServers) {
    lines.push(`[mcp.servers.${server.id}]`);
    if (server.transport === "stdio") {
      lines.push(`command = ${quote(server.endpoint)}`);
    } else {
      lines.push(`url = ${quote(server.endpoint)}`);
      lines.push(`transport = ${quote(server.transport)}`);
    }
    lines.push(`startup_timeout_sec = ${server.timeoutSec}`);
    if (server.rateLimitRpm > 0) {
      lines.push(`rate_limit_rpm = ${server.rateLimitRpm}`);
    }
    if (server.authMode !== "none" && server.secretRef) {
      lines.push(`auth_token_env = ${quote(server.secretRef)}`);
    }
    lines.push("");
  }

  if (activeProviders.length > 0) {
    lines.push("[llm]");
    lines.push(`enabled = ${bool(settings.routing.enabled)}`);
    lines.push(`default_model = ${quote(settings.routing.defaultModel)}`);
    lines.push("");

    for (const provider of activeProviders) {
      lines.push(`[llm.providers.${provider.id}]`);
      lines.push(`protocol = ${quote(provider.protocol)}`);
      lines.push(`base_url = ${quote(provider.baseUrl)}`);
      lines.push(`models = ${quote(provider.models)}`);
      lines.push(`forward_token = ${bool(provider.forwardToken)}`);
      if (provider.rateLimitRpm > 0) {
        lines.push(`rate_limit_rpm = ${provider.rateLimitRpm}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "# UI-only desired behavior until the apply adapter maps it to the exact deployed Nexus version:"
  );
  lines.push(
    `# tool_search.enabled = ${bool(settings.nexus.toolSearch.enabled)}`
  );
  lines.push(
    `# tool_search.fuzzy_match = ${bool(settings.nexus.toolSearch.fuzzyMatch)}`
  );
  lines.push(
    `# tool_search.ranking_strategy = ${quote(settings.nexus.toolSearch.rankingStrategy)}`
  );
  lines.push(`# routing.strategy = ${quote(settings.routing.strategy)}`);
  lines.push(`# routing.privacy_mode = ${bool(settings.routing.privacyMode)}`);

  return lines.join("\n");
}

export function generateLiteLLMYaml(settings: NexusUiSettings) {
  const activeProviders = settings.llmProviders.filter(
    (provider) => provider.enabled
  );
  const lines = [
    "# Generated by apps/nexusUI. Merge with the orchestrator LiteLLM config before deployment.",
    "general_settings:",
    `  master_key: os.environ/${settings.environment.find((item) => item.key === "LITELLM_MASTER_KEY")?.value ?? "LITELLM_MASTER_KEY"}`,
    `  database_url: os.environ/DATABASE_URL`,
    "litellm_settings:",
    `  cache: ${bool(settings.liteLLM.cache)}`,
    `  num_retries: ${settings.liteLLM.retries ? 2 : 0}`,
    `  fallbacks_enabled: ${bool(settings.liteLLM.fallbacks)}`,
    "model_list:",
  ];

  for (const provider of activeProviders) {
    for (const model of provider.models
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)) {
      lines.push(`  - model_name: ${model}`);
      lines.push("    litellm_params:");
      lines.push(`      model: ${provider.protocol}/${model}`);
      lines.push(`      api_base: ${provider.baseUrl}`);
      lines.push(`      rpm: ${provider.rateLimitRpm}`);
    }
  }

  return lines.join("\n");
}

export function summarizeSettings(settings: NexusUiSettings) {
  const enabledGroups = settings.groups.filter((group) => group.enabled).length;
  const enabledTools = settings.tools.filter((tool) => {
    const group = settings.groups.find(
      (candidate) => candidate.id === tool.groupId
    );

    return tool.enabled && group?.enabled;
  }).length;
  const enabledProviders = settings.llmProviders.filter(
    (provider) => provider.enabled
  ).length;

  return {
    enabledGroups,
    enabledTools,
    enabledProviders,
    fuzzyToolFind:
      settings.nexus.toolSearch.enabled && settings.nexus.toolSearch.fuzzyMatch
        ? "enabled"
        : "disabled",
    smartRouting: (settings.routing.enabled
      ? "enabled"
      : "disabled") satisfies z.infer<typeof enabledString>,
  };
}
