"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Boxes,
  FileCode2,
  Gauge,
  Globe2,
  Layers3,
  Network,
  RefreshCcw,
  Route,
  Save,
  Search,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  ToggleRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSettings,
  generateLiteLLMYaml,
  generateNexusToml,
  summarizeSettings,
  type NexusUiSettings,
} from "@/lib/settings";
import { cn } from "@/lib/utils";

type StatusPayload = {
  nexus?: { ok: boolean; status: number; url: string; error?: string };
  liteLLM?: { ok: boolean; status: number; url: string; error?: string };
  checkedAt?: string;
};

const sections = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "groups", label: "Groups", icon: Layers3 },
  { id: "tools", label: "Tools", icon: ToggleRight },
  { id: "routing", label: "Routing", icon: Route },
  { id: "litellm", label: "LiteLLM", icon: Bot },
  { id: "environment", label: "Environment", icon: ServerCog },
  { id: "preview", label: "Config", icon: FileCode2 },
];

function statusBadge(status?: { ok: boolean; status: number }) {
  if (!status) {
    return <Badge variant="outline">unknown</Badge>;
  }

  return <Badge variant={status.ok ? "default" : "destructive"}>{status.ok ? "online" : `offline ${status.status}`}</Badge>;
}

function fieldId(prefix: string, value: string) {
  return `${prefix}-${value.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
}

export function NexusConsole() {
  const [settings, setSettings] = useState<NexusUiSettings>(defaultSettings);
  const [status, setStatus] = useState<StatusPayload>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Loading settings");

  const summary = useMemo(() => summarizeSettings(settings), [settings]);
  const nexusToml = useMemo(() => generateNexusToml(settings), [settings]);
  const liteLLMYaml = useMemo(() => generateLiteLLMYaml(settings), [settings]);

  async function refresh() {
    const [settingsResponse, statusResponse] = await Promise.all([fetch("/api/settings"), fetch("/api/status")]);
    const settingsJson = await settingsResponse.json();
    const statusJson = await statusResponse.json();

    setSettings(settingsJson.settings);
    setStatus(statusJson);
    setMessage("Settings loaded");
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load settings"));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("Saving");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      const json = await response.json();
      setSettings(json.settings);
      setMessage("Saved to Nexus UI settings");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof NexusUiSettings>(key: K, value: NexusUiSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-[8px] border bg-background">
                <Network />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Project Nyra control plane</p>
                <h1 className="text-2xl font-semibold leading-tight">Nexus Router Console</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Configure MCP tool visibility, group-level activation, fuzzy tool discovery, smart routing policy, and
                  LiteLLM integration from one operator surface.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <a href={process.env.NEXT_PUBLIC_WEBAPP_URL ?? "https://nyra.ratehunter.net"}>
                  <Globe2 data-icon="inline-start" />
                  Webapp
                </a>
              </Button>
              <Button variant="outline" onClick={() => refresh()}>
                <RefreshCcw data-icon="inline-start" />
                Refresh
              </Button>
              <Button onClick={save} disabled={saving}>
                <Save data-icon="inline-start" />
                {saving ? "Saving" : "Save"}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Nexus</Badge>
            {statusBadge(status.nexus)}
            <Badge variant="outline">LiteLLM</Badge>
            {statusBadge(status.liteLLM)}
            <Badge variant="secondary">{message}</Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveSection(section.id)}
              >
                <Icon data-icon="inline-start" />
                {section.label}
              </Button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-5">
          <section className={cn("gap-4 md:grid-cols-3", activeSection === "overview" ? "grid" : "hidden")}>
            <MetricCard title="Groups active" value={`${summary.enabledGroups}/${settings.groups.length}`} icon={Layers3} />
            <MetricCard title="Tools available" value={`${summary.enabledTools}/${settings.tools.length}`} icon={Boxes} />
            <MetricCard title="LLM providers" value={`${summary.enabledProviders}/${settings.llmProviders.length}`} icon={Bot} />
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Control Surface</CardTitle>
                <CardDescription>
                  Saves desired operator state to a local settings file. The config preview shows what an apply adapter
                  should render for the deployed Nexus and LiteLLM versions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ToggleRow
                  icon={Search}
                  title="Fuzzy tool find"
                  description="Let agents find tools by approximate names, related words, or aliases."
                  checked={settings.nexus.toolSearch.enabled && settings.nexus.toolSearch.fuzzyMatch}
                  onCheckedChange={(checked) =>
                    update("nexus", {
                      ...settings.nexus,
                      toolSearch: { ...settings.nexus.toolSearch, enabled: checked, fuzzyMatch: checked },
                    })
                  }
                />
                <ToggleRow
                  icon={Route}
                  title="Smart routing"
                  description="Prefer the configured model policy instead of static model selection."
                  checked={settings.routing.enabled}
                  onCheckedChange={(checked) => update("routing", { ...settings.routing, enabled: checked })}
                />
                <ToggleRow
                  icon={ShieldCheck}
                  title="Privacy mode"
                  description="Favor local and private endpoints for sensitive mortgage workflow context."
                  checked={settings.routing.privacyMode}
                  onCheckedChange={(checked) => update("routing", { ...settings.routing, privacyMode: checked })}
                />
                <ToggleRow
                  icon={ServerCog}
                  title="Apply adapter"
                  description="Keep disabled until Nexus config generation is wired to deployment automation."
                  checked={settings.nexus.configApplyEnabled}
                  onCheckedChange={(checked) => update("nexus", { ...settings.nexus, configApplyEnabled: checked })}
                />
              </CardContent>
            </Card>
          </section>

          <section className={cn("grid gap-4 lg:grid-cols-2", activeSection === "groups" ? "grid" : "hidden")}>
            {settings.groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                    <Switch
                      checked={group.enabled}
                      onCheckedChange={(checked) =>
                        update(
                          "groups",
                          settings.groups.map((candidate) =>
                            candidate.id === group.id ? { ...candidate, enabled: checked } : candidate,
                          ),
                        )
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {settings.tools.filter((tool) => tool.groupId === group.id && tool.enabled).length} tools
                  </Badge>
                  <Badge variant={group.enabled ? "default" : "secondary"}>{group.enabled ? "active" : "inactive"}</Badge>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className={cn("flex flex-col gap-4", activeSection === "tools" ? "flex" : "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Tool Discovery</CardTitle>
                <CardDescription>Set fuzzy search behavior and default result limits for agent tool lookup.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <ToggleRow
                  icon={Search}
                  title="Fuzzy match"
                  description="Approximate matching for tool names and descriptions."
                  checked={settings.nexus.toolSearch.fuzzyMatch}
                  onCheckedChange={(checked) =>
                    update("nexus", {
                      ...settings.nexus,
                      toolSearch: { ...settings.nexus.toolSearch, fuzzyMatch: checked },
                    })
                  }
                />
                <Field label="Max results" id="max-results">
                  <Input
                    id="max-results"
                    type="number"
                    min={1}
                    max={100}
                    value={settings.nexus.toolSearch.maxResults}
                    onChange={(event) =>
                      update("nexus", {
                        ...settings.nexus,
                        toolSearch: { ...settings.nexus.toolSearch, maxResults: Number(event.target.value) },
                      })
                    }
                  />
                </Field>
                <Field label="Ranking strategy" id="ranking-strategy">
                  <select
                    id="ranking-strategy"
                    className="h-10 rounded-[8px] border bg-background px-3 text-sm"
                    value={settings.nexus.toolSearch.rankingStrategy}
                    onChange={(event) =>
                      update("nexus", {
                        ...settings.nexus,
                        toolSearch: {
                          ...settings.nexus.toolSearch,
                          rankingStrategy: event.target.value as NexusUiSettings["nexus"]["toolSearch"]["rankingStrategy"],
                        },
                      })
                    }
                  >
                    <option value="exact-first">exact-first</option>
                    <option value="semantic">semantic</option>
                    <option value="hybrid">hybrid</option>
                  </select>
                </Field>
              </CardContent>
            </Card>
            <div className="grid gap-4 xl:grid-cols-2">
              {settings.tools.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <CardTitle>{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </div>
                      <Switch
                        checked={tool.enabled}
                        onCheckedChange={(checked) =>
                          update(
                            "tools",
                            settings.tools.map((candidate) =>
                              candidate.id === tool.id ? { ...candidate, enabled: checked } : candidate,
                            ),
                          )
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="outline">{tool.id}</Badge>
                    <Badge variant={tool.readOnly ? "secondary" : "outline"}>{tool.readOnly ? "read only" : "mutating"}</Badge>
                    <Badge variant={tool.riskLevel === "high" ? "destructive" : "outline"}>{tool.riskLevel}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className={cn("grid gap-4", activeSection === "routing" ? "grid" : "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Smart Routing</CardTitle>
                <CardDescription>
                  Defines the model-routing intent Nexus should expose and LiteLLM should enforce.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ToggleRow
                  icon={Route}
                  title="Routing enabled"
                  description="Use policy-driven model selection."
                  checked={settings.routing.enabled}
                  onCheckedChange={(checked) => update("routing", { ...settings.routing, enabled: checked })}
                />
                <ToggleRow
                  icon={ShieldCheck}
                  title="Explicit allowlist"
                  description="Reject models that are not present in the configured provider list."
                  checked={settings.routing.requireExplicitModelAllowlist}
                  onCheckedChange={(checked) =>
                    update("routing", { ...settings.routing, requireExplicitModelAllowlist: checked })
                  }
                />
                <Field label="Strategy" id="routing-strategy">
                  <select
                    id="routing-strategy"
                    className="h-10 rounded-[8px] border bg-background px-3 text-sm"
                    value={settings.routing.strategy}
                    onChange={(event) =>
                      update("routing", {
                        ...settings.routing,
                        strategy: event.target.value as NexusUiSettings["routing"]["strategy"],
                      })
                    }
                  >
                    <option value="balanced">balanced</option>
                    <option value="latency">latency</option>
                    <option value="cost">cost</option>
                    <option value="privacy">privacy</option>
                    <option value="fallback">fallback</option>
                  </select>
                </Field>
                <Field label="Default model" id="default-model">
                  <Input
                    id="default-model"
                    value={settings.routing.defaultModel}
                    onChange={(event) => update("routing", { ...settings.routing, defaultModel: event.target.value })}
                  />
                </Field>
                <Field label="Fallback model" id="fallback-model">
                  <Input
                    id="fallback-model"
                    value={settings.routing.fallbackModel}
                    onChange={(event) => update("routing", { ...settings.routing, fallbackModel: event.target.value })}
                  />
                </Field>
                <ToggleRow
                  icon={Network}
                  title="Token forwarding"
                  description="Forward user bearer tokens to downstream providers when supported."
                  checked={settings.routing.tokenForwarding}
                  onCheckedChange={(checked) => update("routing", { ...settings.routing, tokenForwarding: checked })}
                />
              </CardContent>
            </Card>
            <div className="grid gap-4 xl:grid-cols-2">
              {settings.llmProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <CardTitle>{provider.name}</CardTitle>
                        <CardDescription>{provider.baseUrl}</CardDescription>
                      </div>
                      <Switch
                        checked={provider.enabled}
                        onCheckedChange={(checked) =>
                          update(
                            "llmProviders",
                            settings.llmProviders.map((candidate) =>
                              candidate.id === provider.id ? { ...candidate, enabled: checked } : candidate,
                            ),
                          )
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Field label="Models" id={fieldId("models", provider.id)}>
                      <Input
                        id={fieldId("models", provider.id)}
                        value={provider.models}
                        onChange={(event) =>
                          update(
                            "llmProviders",
                            settings.llmProviders.map((candidate) =>
                              candidate.id === provider.id ? { ...candidate, models: event.target.value } : candidate,
                            ),
                          )
                        }
                      />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{provider.protocol}</Badge>
                      <Badge variant="outline">{provider.rateLimitRpm} rpm</Badge>
                      <Badge variant="outline">weight {provider.weight}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className={cn("grid gap-4", activeSection === "litellm" ? "grid" : "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>LiteLLM Integration</CardTitle>
                <CardDescription>
                  Keep LiteLLM as the model proxy while Nexus acts as the agent MCP and routing entrypoint.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ToggleRow
                  icon={Bot}
                  title="LiteLLM enabled"
                  description="Include LiteLLM in model routing and status checks."
                  checked={settings.liteLLM.enabled}
                  onCheckedChange={(checked) => update("liteLLM", { ...settings.liteLLM, enabled: checked })}
                />
                <Field label="LiteLLM base URL" id="litellm-url">
                  <Input
                    id="litellm-url"
                    value={settings.liteLLM.baseUrl}
                    onChange={(event) => update("liteLLM", { ...settings.liteLLM, baseUrl: event.target.value })}
                  />
                </Field>
                {[
                  ["virtualKeyMode", "Virtual keys", "Manage budgeted keys and per-agent access."],
                  ["budgetAlerts", "Budget alerts", "Enable spend monitoring hooks."],
                  ["cache", "Cache", "Enable LiteLLM response caching where appropriate."],
                  ["retries", "Retries", "Retry transient model provider failures."],
                  ["fallbacks", "Fallbacks", "Use alternate models when primary routes fail."],
                  ["guardrails", "Guardrails", "Reserve a switch for future policy enforcement."],
                ].map(([key, title, description]) => (
                  <ToggleRow
                    key={key}
                    icon={SlidersHorizontal}
                    title={title}
                    description={description}
                    checked={Boolean(settings.liteLLM[key as keyof NexusUiSettings["liteLLM"]])}
                    onCheckedChange={(checked) =>
                      update("liteLLM", { ...settings.liteLLM, [key]: checked } as NexusUiSettings["liteLLM"])
                    }
                  />
                ))}
                <Field label="Model groups" id="litellm-model-groups">
                  <Input
                    id="litellm-model-groups"
                    value={settings.liteLLM.modelGroups}
                    onChange={(event) => update("liteLLM", { ...settings.liteLLM, modelGroups: event.target.value })}
                  />
                </Field>
              </CardContent>
            </Card>
          </section>

          <section className={cn("grid gap-4 xl:grid-cols-2", activeSection === "environment" ? "grid" : "hidden")}>
            {settings.environment.map((item) => (
              <Card key={item.key}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle>{item.label}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(checked) =>
                        update(
                          "environment",
                          settings.environment.map((candidate) =>
                            candidate.key === item.key ? { ...candidate, enabled: checked } : candidate,
                          ),
                        )
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Field label={item.valueMode === "secret-ref" ? "Secret env reference" : "Value"} id={fieldId("env", item.key)}>
                    <Input
                      id={fieldId("env", item.key)}
                      value={item.value}
                      onChange={(event) =>
                        update(
                          "environment",
                          settings.environment.map((candidate) =>
                            candidate.key === item.key ? { ...candidate, value: event.target.value } : candidate,
                          ),
                        )
                      }
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{item.key}</Badge>
                    <Badge variant={item.required ? "default" : "secondary"}>{item.required ? "required" : "optional"}</Badge>
                    <Badge variant="outline">{item.valueMode}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className={cn("grid gap-4", activeSection === "preview" ? "grid" : "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Nexus TOML Preview</CardTitle>
                <CardDescription>
                  Version-aware apply automation should treat the commented settings as desired policy until mapped to
                  the deployed Nexus release.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea className="min-h-[420px] font-mono text-xs" readOnly value={nexusToml} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>LiteLLM YAML Preview</CardTitle>
                <CardDescription>
                  Merge with the existing orchestrator LiteLLM config and keep provider secrets in environment variables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea className="min-h-[360px] font-mono text-xs" readOnly value={liteLLMYaml} />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Gauge }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardDescription>{title}</CardDescription>
          <Icon />
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: typeof Gauge;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[8px] border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-[8px] border bg-card">
          <Icon />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
