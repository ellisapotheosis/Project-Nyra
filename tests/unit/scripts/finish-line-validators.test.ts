import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  buildServiceHealthTargets,
  validateCloudflareExposure,
  validateMcpEndpointConfig,
  validateProductionEnvReadiness,
  validateSupabaseAuthConfig,
  validateTwentyReadiness,
} from "../../../scripts/release/finish-line-validators.ts";

describe("finish-line validators", () => {
  it("blocks MCP endpoints under ratehunter.net", () => {
    const section = validateMcpEndpointConfig([
      {
        path: ".mcp.json",
        content: '{"url":"https://nexus.ratehunter.net/mcp"}',
      },
    ]);

    expect(section.status).toBe("fail");
    expect(section.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "mcp-ratehunter-domain" }),
      ])
    );
  });

  it("blocks ratehunter tunnel routes and private public origins", () => {
    const section = validateCloudflareExposure([
      {
        path: "infra/hosts/oracle-vps/cloudflared-config.yml",
        content:
          "- hostname: admin.ratehunter.net\n  service: http://postgres:5432\n",
      },
    ]);

    expect(section.status).toBe("fail");
    expect(section.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "ratehunter-tunnel-route",
        "forbidden-public-origin",
      ])
    );
  });

  it("reports env readiness as warnings unless live strict mode is requested", () => {
    const loose = validateProductionEnvReadiness({}, false);
    const strict = validateProductionEnvReadiness({}, true);

    expect(loose.status).toBe("warn");
    expect(loose.issues.every((issue) => issue.severity === "warning")).toBe(
      true
    );
    expect(strict.status).toBe("fail");
    expect(strict.issues.some((issue) => issue.severity === "critical")).toBe(
      true
    );
  });

  it("builds service health targets without accepting placeholders", () => {
    const targets = buildServiceHealthTargets({
      CRM_API_URL: "https://api.projectnyra.com",
      CRM_API_KEY: "replace-me",
    });
    const crm = targets.find((target) => target.service === "crm-api");

    expect(crm).toEqual(
      expect.objectContaining({
        configured: true,
        secretConfigured: false,
      })
    );
  });

  it("validates Supabase auth URL, keys, and redirect readiness", () => {
    const section = validateSupabaseAuthConfig(
      {
        NEXT_PUBLIC_SUPABASE_URL: "api.projectnyra.com",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "replace-me",
      },
      true
    );

    expect(section.status).toBe("fail");
    expect(section.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "supabase-url-invalid",
        "supabase-public-key-missing",
        "supabase-service-role-missing",
        "supabase-redirects-missing",
      ])
    );
  });

  it("checks Twenty mortgage object readiness from source files", () => {
    const root = mkdtempSync(join(tmpdir(), "nyra-twenty-"));
    const sourceDir = join(root, "packages/twenty-custom-objects/src");
    mkdirSync(sourceDir, { recursive: true });

    writeFileSync(
      join(sourceDir, "MortgageLead.ts"),
      "loanPurpose loanAmount consentSms campaignStatus"
    );
    writeFileSync(
      join(sourceDir, "Quote.ts"),
      "loanAmount rate monthlyPayment expiresAt"
    );
    writeFileSync(
      join(sourceDir, "Communication.ts"),
      "channel direction consentSnapshot providerMessageId"
    );
    writeFileSync(
      join(sourceDir, "Campaign.ts"),
      "status quietHours suppressionReason"
    );

    expect(validateTwentyReadiness(root).status).toBe("pass");
  });
});
