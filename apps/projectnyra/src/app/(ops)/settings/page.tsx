"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Shield,
  Database,
  MessageSquare,
  Cpu,
  Brain,
  Network,
  Lock,
  Globe,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Key,
  Zap,
  Bot,
  Mail,
  Phone,
  Smartphone,
  Server,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Badge } from "@nyra/ui";
import { PageHeader } from "@nyra/ui";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [lastSync, setLastSync] = useState(new Date().toLocaleString());

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Registry_Configuration"
        title="Integration Control Room"
        description="Global system registry, secret synchronization state, and provider connectivity management."
        meta={
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-3 py-1"
            >
              INFISICAL_MIRROR: ACTIVE
            </Badge>
            <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-3 py-1">
              STATUS: OPERATIONAL
            </Badge>
          </div>
        }
        actions={
          <Button
            variant="outline"
            className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
          >
            <RefreshCcw className="mr-2 size-3.5" /> TRIGGER_GLOBAL_SYNC
          </Button>
        }
      />

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* 1. CRM Settings */}
        <SettingsGroup title="CRM_Registry" icon={Database} color="indigo">
          <StatusRow
            label="TwentyCRM Endpoint"
            value="crm.projectnyra.com"
            status="CONNECTED"
          />
          <StatusRow
            label="API_Key Protocol"
            value="••••••••••••"
            status="VERIFIED"
          />
          <StatusRow
            label="Webhook Ingress"
            value="capture.projectnyra.com"
            status="ACTIVE"
          />
          <StatusRow label="Schema Sync" value="v1.0_LOCKED" status="HEALTHY" />
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full text-[9px] font-black uppercase h-9 border-border/50 rounded-xl hover:bg-indigo-500/10"
            >
              VALIDATE_SCHEMA_MAPPING
            </Button>
          </div>
        </SettingsGroup>

        {/* 2. Communications */}
        <SettingsGroup
          title="Comm_Dispatch"
          icon={MessageSquare}
          color="turquoise"
        >
          <StatusRow label="Twilio Node" value="US_WEST_01" status="ONLINE" />
          <StatusRow
            label="SendGrid Uplink"
            value="projectnyra.com"
            status="HEALTHY"
          />
          <StatusRow
            label="Gmail_Relay"
            value="ellis@projectnyra.com"
            status="SYNCED"
          />
          <StatusRow label="TCPA Sentinel" value="ENFORCED" status="ACTIVE" />
          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-[9px] font-black uppercase h-9 border-border/50 rounded-xl hover:bg-turquoise-500/10"
            >
              TEST_SMS
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-[9px] font-black uppercase h-9 border-border/50 rounded-xl hover:bg-turquoise-500/10"
            >
              TEST_EMAIL
            </Button>
          </div>
        </SettingsGroup>

        {/* 3. AI Routing */}
        <SettingsGroup title="Model_Orchestration" icon={Cpu} color="indigo">
          <StatusRow
            label="Nexus Router"
            value="nexus.projectnyra.com"
            status="CONNECTED"
          />
          <StatusRow
            label="LiteLLM Gateway"
            value="litellm.projectnyra.com"
            status="ONLINE"
          />
          <StatusRow
            label="OpenRouter Path"
            value="LATENCY: 45ms"
            status="HEALTHY"
          />
          <StatusRow
            label="Local vLLM (5090)"
            value="worker-5090:8000"
            status="BUSY"
          />
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full text-[9px] font-black uppercase h-9 border-border/50 rounded-xl hover:bg-indigo-500/10"
            >
              CALIBRATE_ROUTING_MAP
            </Button>
          </div>
        </SettingsGroup>

        {/* 4. Agent Systems */}
        <SettingsGroup title="Agent_Intelligence" icon={Bot} color="pink">
          <StatusRow label="OpenClaw Core" value="v1.4.2" status="ONLINE" />
          <StatusRow
            label="NerveUI Workers"
            value="3_ACTIVE"
            status="HEALTHY"
          />
          <StatusRow
            label="Skills Registry"
            value="24_LOADED"
            status="ACTIVE"
          />
          <StatusRow label="Voice Engine" value="POCKET_TTS" status="READY" />
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full text-[9px] font-black uppercase h-9 border-pink-500/20 bg-pink-500/5 text-pink-400 rounded-xl hover:bg-pink-500/10"
            >
              ENABLE_HUMAN_APPROVAL_MODE
            </Button>
          </div>
        </SettingsGroup>

        {/* 5. Memory Systems */}
        <SettingsGroup title="Cognitive_Recall" icon={Brain} color="turquoise">
          <StatusRow label="mem0 Context" value="842_FACTS" status="HEALTHY" />
          <StatusRow
            label="OpenMemory MCP"
            value="mempalace-mcp:4040"
            status="ACTIVE"
          />
          <StatusRow
            label="FalkorDB Graph"
            value="nyra_graph"
            status="LOCKED"
          />
          <StatusRow
            label="Persistence"
            value="PG_SQL_MIRROR"
            status="SYNCED"
          />
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full text-[9px] font-black uppercase h-9 border-border/50 rounded-xl hover:bg-turquoise-500/10"
            >
              REBUILD_GRAPH_INDEX
            </Button>
          </div>
        </SettingsGroup>

        {/* 6. Network & Security */}
        <SettingsGroup title="Security_Mesh" icon={Shield} color="indigo">
          <StatusRow
            label="Tailscale Node"
            value="PROJECT_NYRA_HUB"
            status="ONLINE"
          />
          <StatusRow
            label="Cloudflare Tunnel"
            value="tunnel.projectnyra.com"
            status="ACTIVE"
          />
          <StatusRow
            label="Access Protocol"
            value="CF_ACCESS_OAUTH"
            status="LOCKED"
          />
          <StatusRow
            label="Auth Status"
            value="CLERK_JWT_VALID"
            status="HEALTHY"
          />
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full text-[9px] font-black uppercase h-9 border-border/50 rounded-xl hover:bg-indigo-500/10"
            >
              IP_ALLOWLIST_CONFIG
            </Button>
          </div>
        </SettingsGroup>

        {/* 7. Secrets (Infisical) */}
        <Card className="xl:col-span-3 bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]">
          <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl border border-indigo-400/30">
                  <Key className="size-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground italic">
                    Infisical_Secret_Registry
                  </CardTitle>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                    Mirroring secrets from /machines/oracle-vps
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  LAST_MIRROR_SYNC
                </p>
                <p className="text-sm font-black text-turquoise-400 uppercase tracking-tight">
                  {lastSync}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            <SecretPath
              label="TWENTY_CRM_API_KEY"
              path="/machines/oracle-vps/TWENTY_CRM_API_KEY"
              status="MIRRORED"
            />
            <SecretPath
              label="TWILIO_AUTH_TOKEN"
              path="/machines/orchestrator/TWILIO_AUTH_TOKEN"
              status="MIRRORED"
            />
            <SecretPath
              label="NEXUS_API_SECRET"
              path="/machines/oracle-vps/NEXUS_API_SECRET"
              status="MISSING"
            />
            <SecretPath
              label="SENDGRID_MASTER_KEY"
              path="/machines/oracle-vps/SENDGRID_MASTER_KEY"
              status="MIRRORED"
            />
          </CardContent>
          <div className="p-8 bg-indigo-500/5 border-t border-border/30 flex justify-end gap-4">
            <Button
              variant="ghost"
              className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              VIEW_FULL_TRACE
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] px-8 rounded-xl h-11 shadow-lg shadow-indigo-500/30">
              ROTATE_ALL_KEYS
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingsGroup({ title, icon: Icon, color, children }: any) {
  const colorMap: any = {
    indigo: "border-t-indigo-500",
    turquoise: "border-t-turquoise-500",
    pink: "border-t-pink-500",
  };
  return (
    <Card
      className={cn(
        "bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden rounded-[32px] flex flex-col",
        colorMap[color]
      )}
    >
      <CardHeader className="bg-background/20 border-b border-border/50 p-6">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
          <Icon
            className={cn(
              "size-4",
              color === "indigo"
                ? "text-indigo-400"
                : color === "turquoise"
                  ? "text-turquoise-400"
                  : "text-pink-400"
            )}
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4 flex-1">{children}</CardContent>
    </Card>
  );
}

function StatusRow({ label, value, status }: any) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/30 bg-background/40 shadow-inner group hover:bg-indigo-500/5 transition-all">
      <div className="space-y-1 min-w-0">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
          {label}
        </p>
        <p className="text-xs font-black text-foreground uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors">
          {value}
        </p>
      </div>
      <Badge
        className={cn(
          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-lg",
          status === "CONNECTED" ||
            status === "HEALTHY" ||
            status === "ONLINE" ||
            status === "SYNCED"
            ? "bg-turquoise-500 text-black"
            : "bg-pink-500 text-white"
        )}
      >
        {status}
      </Badge>
    </div>
  );
}

function SecretPath({ label, path, status }: any) {
  return (
    <div className="space-y-3 p-5 rounded-2xl bg-background/50 border border-border/30 shadow-inner group hover:border-indigo-500/30 transition-all">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
          {label}
        </p>
        <div
          className={cn(
            "size-2 rounded-full",
            status === "MIRRORED"
              ? "bg-turquoise-500 shadow-[0_0_8px_rgba(20,184,166,1)]"
              : "bg-pink-500 animate-pulse"
          )}
        />
      </div>
      <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-tight break-all opacity-60 group-hover:opacity-100 transition-opacity">
        {path}
      </p>
      <div className="flex justify-between items-center pt-2">
        <span className="text-[8px] font-black uppercase text-muted-foreground">
          {status}
        </span>
        <button className="text-[8px] font-black uppercase text-indigo-400 hover:underline tracking-widest">
          DETAILS →
        </button>
      </div>
    </div>
  );
}
