import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export type ValidationSeverity = "critical" | "warning";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  message: string;
  file?: string;
};

export type ValidationSection = {
  name: string;
  status: "pass" | "warn" | "fail";
  issues: ValidationIssue[];
};

export type FinishLineReadinessReport = {
  schemaVersion: 1;
  generatedAt: string;
  strictLive: boolean;
  sections: ValidationSection[];
  summary: {
    critical: number;
    warnings: number;
  };
};

export type ServiceHealthTarget = {
  service: string;
  urlEnv: string;
  secretEnv?: string;
  configured: boolean;
  secretConfigured?: boolean;
};

const FORBIDDEN_PUBLIC_ORIGIN_TOKENS = [
  "postgres",
  "redis",
  "falkordb",
  "qdrant",
  "vllm",
  "ollama",
  "docker.sock",
  "worker-rtx",
];

const REQUIRED_TWENTY_OBJECTS = [
  {
    file: "packages/twenty-custom-objects/src/MortgageLead.ts",
    fields: ["loanPurpose", "loanAmount", "consentSms", "campaignStatus"],
  },
  {
    file: "packages/twenty-custom-objects/src/Quote.ts",
    fields: ["loanAmount", "rate", "monthlyPayment", "expiresAt"],
  },
  {
    file: "packages/twenty-custom-objects/src/Communication.ts",
    fields: ["channel", "direction", "consentSnapshot", "providerMessageId"],
  },
  {
    file: "packages/twenty-custom-objects/src/Campaign.ts",
    fields: ["status", "quietHours", "suppressionReason"],
  },
];

const SERVICE_HEALTH_TARGETS: Array<
  Omit<ServiceHealthTarget, "configured" | "secretConfigured">
> = [
  { service: "crm-api", urlEnv: "CRM_API_URL", secretEnv: "CRM_API_KEY" },
  { service: "lead-ingestion", urlEnv: "LEAD_INGESTION_API_URL" },
  { service: "campaign-service", urlEnv: "CAMPAIGN_ENGINE_URL" },
  {
    service: "quote-service",
    urlEnv: "QUOTE_API_URL",
    secretEnv: "QUOTE_API_SECRET",
  },
  { service: "communication-service", urlEnv: "COMMUNICATION_SERVICE_URL" },
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

export function validateMcpEndpointConfig(
  files: Array<{ path: string; content: string }>
): ValidationSection {
  const issues: ValidationIssue[] = [];

  for (const file of files) {
    for (const url of extractUrls(file.content)) {
      const parsed = parseUrl(url);
      if (!parsed) {
        continue;
      }

      const isMcpUrl =
        parsed.pathname.includes("/mcp") || parsed.hostname.includes("mcp");

      if (isMcpUrl && parsed.hostname.endsWith("ratehunter.net")) {
        issues.push({
          severity: "critical",
          code: "mcp-ratehunter-domain",
          file: file.path,
          message: `MCP endpoint ${url} uses ratehunter.net; MCP/API surfaces must use projectnyra.com or private Nexus routing.`,
        });
      }

      if (
        isMcpUrl &&
        parsed.protocol === "http:" &&
        !["localhost", "127.0.0.1"].includes(parsed.hostname) &&
        !parsed.hostname.endsWith(".ts.net")
      ) {
        issues.push({
          severity: "warning",
          code: "mcp-plain-http",
          file: file.path,
          message: `MCP endpoint ${url} is plain HTTP outside localhost/Tailscale.`,
        });
      }
    }
  }

  return buildSection("MCP endpoint config", issues);
}

export function validateCloudflareExposure(
  files: Array<{ path: string; content: string }>
): ValidationSection {
  const issues: ValidationIssue[] = [];

  for (const file of files) {
    const isTunnelConfig = /cloudflared|tunnel/i.test(file.path);
    const lines = file.content.split(/\r?\n/);

    lines.forEach((line, index) => {
      const lower = line.toLowerCase();

      if (isTunnelConfig && lower.includes("ratehunter.net")) {
        issues.push({
          severity: "critical",
          code: "ratehunter-tunnel-route",
          file: `${file.path}:${index + 1}`,
          message:
            "ratehunter.net appears in a tunnel config; it must remain Cloudflare Pages only.",
        });
      }

      if (lower.includes("service:")) {
        for (const token of FORBIDDEN_PUBLIC_ORIGIN_TOKENS) {
          if (lower.includes(token)) {
            issues.push({
              severity: "critical",
              code: "forbidden-public-origin",
              file: `${file.path}:${index + 1}`,
              message: `Forbidden private origin token '${token}' appears in a public tunnel service line.`,
            });
          }
        }
      }
    });
  }

  return buildSection("Cloudflare exposure", issues);
}

export function buildServiceHealthTargets(
  env: NodeJS.ProcessEnv
): ServiceHealthTarget[] {
  return SERVICE_HEALTH_TARGETS.map((target) => ({
    ...target,
    configured: hasRealValue(env[target.urlEnv]),
    secretConfigured: target.secretEnv
      ? hasRealValue(env[target.secretEnv])
      : undefined,
  }));
}

export function validateProductionEnvReadiness(
  env: NodeJS.ProcessEnv,
  strictLive = false
): ValidationSection {
  const issues: ValidationIssue[] = [];

  for (const target of buildServiceHealthTargets(env)) {
    const severity: ValidationSeverity = strictLive ? "critical" : "warning";

    if (!target.configured) {
      issues.push({
        severity,
        code: "service-url-missing",
        message: `${target.service} is missing ${target.urlEnv}.`,
      });
    }

    if (target.secretEnv && !target.secretConfigured) {
      issues.push({
        severity,
        code: "service-secret-missing",
        message: `${target.service} is missing ${target.secretEnv}.`,
      });
    }
  }

  return buildSection("Production env readiness", issues);
}

export function validateSupabaseAuthConfig(
  env: NodeJS.ProcessEnv,
  strictLive = false
): ValidationSection {
  const issues: ValidationIssue[] = [];
  const severity: ValidationSeverity = strictLive ? "critical" : "warning";
  const publicUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasRealValue(publicUrl)) {
    issues.push({
      severity,
      code: "supabase-url-missing",
      message: "NEXT_PUBLIC_SUPABASE_URL is missing or placeholder-only.",
    });
  } else if (!/^https?:\/\//.test(publicUrl ?? "")) {
    issues.push({
      severity: "critical",
      code: "supabase-url-invalid",
      message: "NEXT_PUBLIC_SUPABASE_URL must be an absolute http(s) URL.",
    });
  }

  if (!hasRealValue(publicKey)) {
    issues.push({
      severity,
      code: "supabase-public-key-missing",
      message:
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.",
    });
  }

  if (!hasRealValue(env.SUPABASE_SERVICE_ROLE_KEY)) {
    issues.push({
      severity,
      code: "supabase-service-role-missing",
      message:
        "SUPABASE_SERVICE_ROLE_KEY is missing for server-side auth/admin checks.",
    });
  }

  if (
    !hasRealValue(env.NEXT_PUBLIC_SITE_URL) &&
    !hasRealValue(env.NEXT_PUBLIC_APP_URL) &&
    !hasRealValue(env.SUPABASE_AUTH_REDIRECT_URLS)
  ) {
    issues.push({
      severity,
      code: "supabase-redirects-missing",
      message:
        "No canonical app URL or Supabase auth redirect allowlist env was found.",
    });
  }

  return buildSection("Supabase auth config", issues);
}

export function validateTwentyReadiness(
  rootDir = process.cwd()
): ValidationSection {
  const issues: ValidationIssue[] = [];

  for (const object of REQUIRED_TWENTY_OBJECTS) {
    const absolutePath = join(rootDir, object.file);

    if (!existsSync(absolutePath)) {
      issues.push({
        severity: "critical",
        code: "twenty-object-missing",
        file: object.file,
        message: `Twenty custom object source is missing: ${object.file}.`,
      });
      continue;
    }

    const content = readFileSync(absolutePath, "utf8");
    for (const field of object.fields) {
      if (!content.includes(field)) {
        issues.push({
          severity: "warning",
          code: "twenty-field-not-found",
          file: object.file,
          message: `Expected Twenty readiness field '${field}' was not found.`,
        });
      }
    }
  }

  return buildSection("Twenty CRM schema readiness", issues);
}

export async function buildFinishLineReadinessReport(
  options: {
    rootDir?: string;
    env?: NodeJS.ProcessEnv;
    strictLive?: boolean;
  } = {}
): Promise<FinishLineReadinessReport> {
  const rootDir = options.rootDir ?? process.cwd();
  const env = options.env ?? process.env;
  const strictLive = options.strictLive ?? false;
  const sections = [
    validateMcpEndpointConfig(
      readExistingFiles(rootDir, [
        ".mcp.json",
        ".codex/config.toml",
        "infra/configs/nexus/nexus.toml",
        "infra/hosts/oracle-vps/nexus.toml",
      ])
    ),
    validateCloudflareExposure(
      readExistingFiles(rootDir, [
        "infra/cloudflare/desired-state/exposure-matrix.yml",
        "infra/hosts/oracle-vps/cloudflared-config.yml",
        "infra/hosts/orchestrator/cloudflared-config.yml",
        "infra/hosts/worker-rtx3060/cloudflared-config.yml",
        "infra/hosts/worker-rtx3090ti/cloudflared-config.yml",
        "infra/hosts/worker-rtx5090/cloudflared-config.yml",
      ])
    ),
    validateProductionEnvReadiness(env, strictLive),
    validateSupabaseAuthConfig(env, strictLive),
    validateTwentyReadiness(rootDir),
  ];
  const summary = summarize(sections);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    strictLive,
    sections,
    summary,
  };
}

function readExistingFiles(rootDir: string, relativePaths: string[]) {
  return relativePaths
    .map((relativePath) => {
      const absolutePath = join(rootDir, relativePath);
      if (!existsSync(absolutePath)) {
        return null;
      }

      return {
        path: relativePath,
        content: readFileSync(absolutePath, "utf8"),
      };
    })
    .filter((file): file is { path: string; content: string } => Boolean(file));
}

function buildSection(
  name: string,
  issues: ValidationIssue[]
): ValidationSection {
  const hasCritical = issues.some((issue) => issue.severity === "critical");
  return {
    name,
    status: hasCritical ? "fail" : issues.length > 0 ? "warn" : "pass",
    issues,
  };
}

function summarize(sections: ValidationSection[]) {
  return sections.reduce(
    (summary, section) => {
      for (const issue of section.issues) {
        if (issue.severity === "critical") {
          summary.critical += 1;
        } else {
          summary.warnings += 1;
        }
      }

      return summary;
    },
    { critical: 0, warnings: 0 }
  );
}

function extractUrls(content: string): string[] {
  return content.match(/https?:\/\/[^\s"'`<>]+/g) ?? [];
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function hasRealValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return !/^(replace-me|changeme|todo|tbd|example|placeholder)$/i.test(
    value.trim()
  );
}

async function writeReport(
  reportDir: string,
  report: FinishLineReadinessReport
) {
  await mkdir(reportDir, { recursive: true });
  const stamp = report.generatedAt.replace(/[-:.TZ]/g, "").slice(0, 14);
  const reportPath = join(reportDir, `finish-line-readiness-${stamp}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return reportPath;
}

function getArgValue(argv: string[], key: string): string | undefined {
  const index = argv.indexOf(key);
  return index === -1 ? undefined : argv[index + 1];
}

async function main() {
  const argv = process.argv.slice(2);
  const strictLive = argv.includes("--strict-live");
  const reportDir =
    getArgValue(argv, "--report-dir") ?? "tests/results/finish-line-readiness";
  const report = await buildFinishLineReadinessReport({ strictLive });
  const reportPath = await writeReport(reportDir, report);

  console.log("Finish-line readiness validators complete", {
    reportPath,
    critical: report.summary.critical,
    warnings: report.summary.warnings,
    strictLive,
  });

  for (const section of report.sections) {
    console.log(`${section.status.toUpperCase()} ${section.name}`);
    for (const issue of section.issues) {
      console.log(
        `- [${issue.severity}] ${issue.code}: ${issue.file ? `${issue.file}: ` : ""}${issue.message}`
      );
    }
  }

  if (report.summary.critical > 0) {
    process.exitCode = 1;
  }
}

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  void main();
}
