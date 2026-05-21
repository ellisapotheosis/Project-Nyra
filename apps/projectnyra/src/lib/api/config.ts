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
