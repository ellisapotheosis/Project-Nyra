/**
 * CRM API proxy helper for Next.js API routes.
 *
 * Eliminates the duplicated CRM_API_URL / CRM_API_KEY / try-catch-fallback
 * pattern found across:
 *   - apps/projectnyra/app/api/leads/route.ts
 *   - apps/projectnyra/app/api/leads/[id]/route.ts
 *   - apps/projectnyra/app/api/leads/[id]/conversation/route.ts
 *   - apps/projectnyra/app/api/leads/[id]/campaign/route.ts
 */

const CRM_API_URL = process.env["CRM_API_URL"];
const CRM_API_KEY = process.env["CRM_API_KEY"];

export interface CrmProxyOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface CrmProxyResult<T> {
  ok: true;
  data: T;
}

export interface CrmProxyFailure {
  ok: false;
}

/**
 * Attempt to proxy a request to the CRM API.
 *
 * Returns `{ ok: true, data }` on success, or `{ ok: false }` when the
 * CRM API is unavailable / not configured — letting the caller fall back
 * to mock data.
 */
export async function crmProxy<T = unknown>(
  path: string,
  options: CrmProxyOptions = {}
): Promise<CrmProxyResult<T> | CrmProxyFailure> {
  if (!CRM_API_URL) return { ok: false };

  const { method = "GET", body, headers = {} } = options;

  try {
    const fetchHeaders: Record<string, string> = {
      ...headers,
    };

    if (CRM_API_KEY) {
      fetchHeaders["x-crm-api-key"] = CRM_API_KEY;
    }

    if (body !== undefined && !fetchHeaders["Content-Type"]) {
      fetchHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${CRM_API_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`,
      {
        method,
        headers: fetchHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = (await response.json()) as T;
      return { ok: true, data };
    }
  } catch {
    // CRM unavailable — caller should fall back to mock data
  }

  return { ok: false };
}
