import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

describe("lead ingestion server", () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("rejects ingestion requests when the configured API key is missing", async () => {
    const { postLead, close } = await startServerWithEnv({
      LEAD_INGESTION_API_KEY: "lead-secret",
    });

    try {
      const response = await postLead();
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        error: "Unauthorized",
      });
    } finally {
      await close();
    }
  });

  it("rejects ingestion requests when the configured API key does not match", async () => {
    const { postLead, close } = await startServerWithEnv({
      LEAD_INGESTION_API_KEY: "lead-secret",
    });

    try {
      const response = await postLead("wrong-secret");
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toMatchObject({
        error: "Unauthorized",
      });
    } finally {
      await close();
    }
  });

  it("fails closed in production when the API key is not configured", async () => {
    const { postLead, close } = await startServerWithEnv({
      NODE_ENV: "production",
      LEAD_INGESTION_API_KEY: undefined,
    });

    try {
      const response = await postLead();
      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toMatchObject({
        error: "Lead ingestion API key is not configured.",
      });
    } finally {
      await close();
    }
  });

  it("accepts ingestion requests with the configured API key", async () => {
    const { postLead, close } = await startServerWithEnv({
      LEAD_INGESTION_API_KEY: "lead-secret",
    });

    try {
      const response = await postLead("lead-secret");
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        lead: {
          email: "casey@example.com",
          consentStatus: "OPTED_IN",
        },
      });
    } finally {
      await close();
    }
  });
});

async function startServerWithEnv(env: NodeJS.ProcessEnv) {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: "test",
    ...env,
  };
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    }
  }
  delete process.env.CRM_API_URL;
  delete process.env.CRM_API_KEY;

  const { app } = await import("./server.js");
  const server = await listen(app);
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}/api/leads/ingest`;

  return {
    postLead: (apiKey?: string) =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-lead-ingestion-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          firstName: "Casey",
          lastName: "Borrower",
          email: "casey@example.com",
          source: "ratehunter",
          consentEmail: true,
        }),
      }),
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

function listen(app: import("express").Express): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}
