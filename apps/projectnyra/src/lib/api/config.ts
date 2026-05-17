export const NYRA_ENABLE_MOCKS = process.env.NYRA_ENABLE_MOCKS === "true";

export const serviceConfig = {
  crmApiUrl: process.env.CRM_API_URL || "",
  crmApiKey: process.env.CRM_API_KEY || "",
  campaignEngineUrl: process.env.CAMPAIGN_ENGINE_URL || "",
  quoteApiUrl: process.env.QUOTE_API_URL || process.env.QUOTE_ENGINE_URL || "",
  quoteApiSecret: process.env.QUOTE_API_SECRET || "",
  openClawBaseUrl: process.env.OPENCLAW_PUBLIC_BASE_URL || "",
  openClawChatPath: process.env.OPENCLAW_CHAT_PATH || "/v1/chat/completions",
  openClawGatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN || "",
  openClawDefaultModel: process.env.OPENCLAW_DEFAULT_MODEL || "",
  internalProxyToken: process.env.NYRA_CHAT_INTERNAL_PROXY_TOKEN || "",
  twentyCrmUrl:
    process.env.TWENTY_CRM_URL || process.env.TWENTY_SERVER_URL || "",
  activepiecesBaseUrl: process.env.ACTIVEPIECES_BASE_URL || "",
  n8nBaseUrl: process.env.N8N_BASE_URL || "",
  nexusRouterUrl: process.env.NEXUS_ROUTER_URL || "",
  liteLlmBaseUrl: process.env.LITELLM_BASE_URL || "",
  llxprtBridgeUrl: process.env.LLXPRT_BRIDGE_URL || "",
  llxprtBridgeApiKey: process.env.LLXPRT_BRIDGE_API_KEY || "",
  openMemoryUrl: process.env.OPENMEMORY_URL || "",
  mem0Url: process.env.MEM0_URL || "",
  qdrantUrl: process.env.QDRANT_URL || "",
  falkorDbUrl: process.env.FALKORDB_URL || "",
  paperclipUrl: process.env.PAPERCLIP_URL || "",
};

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
