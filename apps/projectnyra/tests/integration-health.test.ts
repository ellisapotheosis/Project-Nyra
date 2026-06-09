import { getIntegrationHealthSnapshot } from "../src/lib/api/integrationHealth";

const ORIGINAL_FETCH = global.fetch;

describe("integration health snapshot", () => {
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    jest.restoreAllMocks();
  });

  it("marks production readiness false when required service config is missing", async () => {
    const snapshot = await getIntegrationHealthSnapshot({
      env: {
        NODE_ENV: "production",
        NYRA_ENABLE_MOCKS: "false",
      } as NodeJS.ProcessEnv,
      probe: false,
      now: new Date("2026-05-26T12:00:00.000Z"),
    });

    expect(snapshot.ready).toBe(false);
    expect(snapshot.production).toBe(true);
    expect(snapshot.missingProductionConfig).toContain("CRM_API_URL");
    expect(snapshot.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "twenty-crm",
          status: "not_configured",
          alert: "TWENTY_CRM_URL is not configured.",
        }),
      ])
    );
  });

  it("probes configured integration health without exposing secret values", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const snapshot = await getIntegrationHealthSnapshot({
      env: {
        NODE_ENV: "production",
        NYRA_ENABLE_MOCKS: "false",
        TWENTY_CRM_URL: "http://twenty:3000",
        TWENTY_API_KEY: "super-secret-value",
      } as NodeJS.ProcessEnv,
      timeoutMs: 100,
      now: new Date("2026-05-26T12:00:00.000Z"),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://twenty:3000/healthz",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(snapshot.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "twenty-crm",
          status: "healthy",
          secretEnvs: ["TWENTY_API_KEY", "TWENTY_CRM_API_KEY"],
        }),
      ])
    );
    expect(JSON.stringify(snapshot)).not.toContain("super-secret-value");
  });
});

export {};
