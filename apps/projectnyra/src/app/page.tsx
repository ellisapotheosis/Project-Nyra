"use client";

import { useAuth } from "@/lib/auth-context";
import { RevealHero } from "@/components/landing/RevealHero";
import { ClusterHealthHeartbeat } from "@/components/telemetry/cluster-health";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import {
  ChromaAlertCard,
  ChromaMetricCard,
  NyraGlowSurface,
} from "@/components/chroma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Workflow,
  Cpu,
  Monitor,
  Zap,
  Users,
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";

function AnimatedCounter({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  return (
    <>{isCurrency ? `$${value.toLocaleString()}` : value.toLocaleString()}</>
  );
}

function NyraSacredCore({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-[32px] border border-indigo-500/20 bg-indigo-500/5",
        className
      )}
    >
      <div className="absolute size-72 rounded-full border border-turquoise-400/20 shadow-[0_0_80px_rgba(45,212,191,0.18)]" />
      <div className="absolute size-48 rounded-full border border-indigo-400/30 rotate-45" />
      <div className="size-24 rounded-3xl bg-indigo-600/80 shadow-[0_0_80px_rgba(99,102,241,0.5)]" />
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-indigo-400 font-black tracking-widest uppercase text-sm">
          INITIALIZING_NEURAL_COMMAND...
        </div>
      </div>
    );
  }

  if (!user) {
    return <RevealHero />;
  }

  // Authenticated Dashboard View
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />
      <main className="space-y-16 py-10 max-w-[1600px] mx-auto px-6 lg:px-8">
        {/* High-Fidelity Internal Landing Hero */}
        <section className="relative px-6 py-20 rounded-[48px] border border-indigo-500/20 bg-card/20 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.1),transparent_40%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
              <div>
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.4em] mb-6 shadow-inner"
                >
                  MISSION_PROTOCOL_v1.0_ACTIVE
                </Badge>
                <h1 className="text-7xl font-black tracking-tighter text-foreground leading-[0.85] lg:text-8xl uppercase italic">
                  The Neural <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-turquoise-400 to-indigo-600">
                    Command_Deck
                  </span>
                </h1>
                <p className="mt-8 text-xl text-muted-foreground font-medium max-w-xl leading-relaxed uppercase tracking-tight opacity-70">
                  Synchronized Mortgage Orchestration for Ellis Andersen. <br />
                  <span className="text-indigo-400">
                    Project Nyra Foundation Layer: LOCKED.
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link
                  href="/leads"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] px-12 h-16 rounded-2xl shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all text-[11px] group"
                  )}
                >
                  INITIATE_COCKPIT{" "}
                  <ChevronRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/assistant"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-indigo-500/30 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-[0.2em] px-12 h-16 rounded-2xl hover:bg-indigo-500/10 transition-all text-[11px]"
                  )}
                >
                  ASK_NYRA_AI
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-6 opacity-40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-turquoise-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Compliance_Secure
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Zero_Latency_Ingress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LockKeyhole className="size-4 text-pink-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Secret_Isolated
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
              <NyraSacredCore className="h-[500px] bg-transparent border-none shadow-none" />
            </div>
          </div>
        </section>

        {/* Global Performance Metrics */}
        <section className="space-y-8">
          <div className="flex items-end justify-between border-b border-border/30 pb-4">
            <div>
              <p className="text-turquoise-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                Telemetry_Pulse
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                System_Overview
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <ClusterHealthHeartbeat />
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">
                Last Refreshed: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              title="Leads_Today"
              value="12"
              change="+8%"
              trend="up"
              color="indigo"
              icon={Users}
            />
            <MetricCard
              title="Active_Quotes"
              value="847"
              change="+12%"
              trend="up"
              color="turquoise"
              icon={Calculator}
            />
            <MetricCard
              title="Pipeline_Val"
              value="$24.5M"
              change="+5%"
              trend="up"
              color="indigo"
              icon={DollarSign}
            />
            <MetricCard
              title="Conversion"
              value="3.2%"
              change="-0.3%"
              trend="down"
              color="pink"
              icon={TrendingUp}
            />
            <MetricCard
              title="Compliance"
              value="98.5%"
              change="+0.5%"
              trend="up"
              color="turquoise"
              icon={ShieldCheck}
            />
          </div>
          <NyraGlowSurface className="p-6">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <ChromaAlertCard
                title="First-response approval gate"
                detail="A borrower-facing SMS draft is ready. Automation remains paused until Ellis approves or edits the response."
                action="Review draft"
                mode="critical"
              />
              <ChromaMetricCard
                label="OpenClaw tools"
                value="9 ready"
                detail="Quote, SMS, SendGrid, TwentyCRM, campaigns, docs, tasking, history, escalation."
                mode="brand"
              />
              <ChromaMetricCard
                label="Live compliance"
                value="Clear"
                detail="No DNC, STOP, quiet-hours, or consent blocks on the current lead."
                mode="live"
              />
            </div>
          </NyraGlowSurface>
        </section>

        <section className="grid gap-12 lg:grid-cols-2">
          {/* Recent Activity Feed */}
          <Card className="bg-card/40 border-border/50 shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]">
            <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8 pb-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                <Zap className="size-4" /> RECENT_SYSTEM_TRACE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 p-5 rounded-2xl border border-border/30 bg-background/40 hover:bg-indigo-500/5 transition-all group shadow-inner"
                >
                  <div className="size-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <activity.icon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60 italic">
                      {activity.desc}
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">
                    {activity.time}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Urgency / Health Buffer */}
          <div className="space-y-8">
            <Card className="bg-card/40 border-pink-500/30 overflow-hidden shadow-2xl backdrop-blur-md border-t-2 border-t-pink-500 rounded-[32px]">
              <CardHeader className="bg-pink-500/5 border-b border-border/50 p-8 pb-6">
                <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">
                  <AlertTriangle className="size-4" />
                  SYSTEM_URGENCY_BUFFER
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <AlertItem
                  title="Rate_Lock_Expiration"
                  desc="3 loans expiring within 7 days."
                  action="REVIEW_LOCKS"
                  color="pink"
                />
                <AlertItem
                  title="Campaign_Success"
                  desc="Refi_Blitz_V2 showing 42% reply."
                  action="VIEW_STATS"
                  color="turquoise"
                />
                <AlertItem
                  title="Cluster_Load_Spike"
                  desc="RTX5090 at 94% VRAM capacity."
                  action="ROUTE_POLICY"
                  color="indigo"
                />
              </CardContent>
            </Card>

            {/* Memory Cluster Link */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl rounded-[32px] overflow-hidden group">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="size-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-indigo-400/30 group-hover:scale-105 transition-transform relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                  <Bot className="size-10 text-white relative z-10" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
                    AI_OPERATOR_ONLINE
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60 italic mt-3 max-w-xs mx-auto">
                    "Processing 1,452 cognitive memory particles across the
                    cluster. Goal alignment: 98.5%."
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <Link href="/memory" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-inner"
                    >
                      ACCESS_MEMPALACE_GRAPH
                    </Button>
                  </Link>
                  <a
                    href="https://openmemory.projectnyra.com/mcp"
                    target="_blank"
                    className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors"
                  >
                    OpenMemory_MCP_Diagnostic_Bridge
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="pt-16 border-t border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30">
            Project Nyra Foundation · Neural Command v1.0 · West Capital Lending
          </p>
          <div className="flex items-center gap-8">
            <Badge
              variant="outline"
              className="border-turquoise-500/20 bg-turquoise-500/5 text-turquoise-400 font-black text-[10px] uppercase tracking-widest px-5 py-1 rounded-lg shadow-inner"
            >
              Ellis Andersen · Licensed Broker
            </Badge>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">
              SYSTEM_PROTOCOL_LOCKED
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 border-t-indigo-500",
    turquoise: "text-turquoise-400 border-t-turquoise-500",
    pink: "text-pink-400 border-t-pink-500",
  };
  const trendColor = trend === "up" ? "text-turquoise-400" : "text-pink-400";

  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.]/g, ""))
      : value;
  const isCurrency = typeof value === "string" && value.startsWith("$");
  const isPercent = typeof value === "string" && value.endsWith("%");

  return (
    <Card
      className={cn(
        "bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden group hover:border-indigo-500/30 transition-all",
        colorMap[color]
      )}
    >
      <CardHeader className="pb-2 bg-background/20 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground/40 group-hover:text-indigo-400 transition-colors" />
      </CardHeader>
      <CardContent className="pt-5">
        <div className="text-4xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform">
          {isCurrency ? (
            <AnimatedCounter value={numValue * 1000000} isCurrency />
          ) : isPercent ? (
            <>{value}</>
          ) : (
            <AnimatedCounter value={numValue} />
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span
            className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded-lg bg-background/50 border border-border/30 shadow-inner",
              trendColor
            )}
          >
            {change}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
            DELTA_PULSE
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ title, desc, action, color }: any) {
  const colorMap: any = {
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    turquoise: "border-turquoise-500/20 bg-turquoise-500/5 text-turquoise-400",
    pink: "border-pink-500/20 bg-pink-500/5 text-pink-400",
  };
  return (
    <div
      className={cn(
        "p-5 rounded-2xl border flex flex-col gap-4 group hover:scale-[1.02] transition-transform shadow-lg",
        colorMap[color]
      )}
    >
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-black uppercase tracking-tight italic">
          {title}
        </p>
        <div className="size-2 rounded-full bg-current animate-pulse shadow-current shadow-[0_0_10px]" />
      </div>
      <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-relaxed">
        {desc}
      </p>
      <button className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground hover:text-indigo-400 hover:underline text-left mt-2 transition-colors">
        {action}_INVOKE →
      </button>
    </div>
  );
}

const recentActivity = [
  {
    title: "NEW_LEAD_INGRESS",
    desc: "Sarah Johnson - $450k PURCHASE",
    time: "5M_AGO",
    icon: Users,
  },
  {
    title: "QUOTE_ENGINE_DISPATCH",
    desc: "Michael Chen - 30Y CONV @ 6.8%",
    time: "12M_AGO",
    icon: Calculator,
  },
  {
    title: "APPLICATION_LOCKED",
    desc: "Lisa Rodriguez - $325k FHA",
    time: "18M_AGO",
    icon: CheckCircle,
  },
  {
    title: "COMPLIANCE_PASS",
    desc: "TILA-RESPA LE Delivered",
    time: "32M_AGO",
    icon: ShieldCheck,
  },
];
