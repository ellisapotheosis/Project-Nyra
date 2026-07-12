/**
 * Base API client for Project Nyra services.
 * Handles headers, error management, and typed responses.
 */

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  endpoint: string,
  options: ApiClientOptions,
  init?: RequestInit
): Promise<T> {
  // Ensure endpoint starts with / and baseUrl doesn't end with /
  const sanitizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const sanitizedBaseUrl = options.baseUrl.replace(/\/$/, "");
  const url = `${sanitizedBaseUrl}${sanitizedEndpoint}`;

  const headers = new Headers(init?.headers);

  if (options.apiKey) {
    headers.set(options.apiKeyHeader ?? "x-api-key", options.apiKey);
  }

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      try {
        errorData = await response.text();
      } catch {
        errorData = null;
      }
    }
    throw new ApiError(
      response.status,
      `API request failed: ${response.statusText}`,
      errorData
    );
  }

  // Handle No Content response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Creates a REST client with standard HTTP methods.
 */
export function createClient(options: ApiClientOptions) {
  return {
    get: <T>(endpoint: string, init?: RequestInit) =>
      request<T>(endpoint, options, { ...init, method: "GET" }),

    post: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
      request<T>(endpoint, options, {
        ...init,
        method: "POST",
        body: body
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
      }),

    put: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
      request<T>(endpoint, options, {
        ...init,
        method: "PUT",
        body: body
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
      }),

    patch: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
      request<T>(endpoint, options, {
        ...init,
        method: "PATCH",
        body: body
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
      }),

    delete: <T>(endpoint: string, init?: RequestInit) =>
      request<T>(endpoint, options, { ...init, method: "DELETE" }),
  };
}
