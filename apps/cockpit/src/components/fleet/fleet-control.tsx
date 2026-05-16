"use client"

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  AudioLines,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleStop,
  Cpu,
  Database,
  FileJson,
  FolderGit2,
  Gauge,
  GitBranch,
  HardDrive,
  Languages,
  ListTree,
  Loader2,
  LockKeyhole,
  MemoryStick,
  MessageSquareText,
  Mic,
  Network,
  Pause,
  Play,
  Power,
  Radio,
  RefreshCcw,
  Route,
  ScrollText,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Volume2,
  Workflow,
  Zap,
  Layout,
  Box,
  Monitor,
  ArrowLeft,
  Clock,
  History
} from "lucide-react"

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@nyra/ui"
import { PageHeader } from "@nyra/ui"
import { cn } from "@/lib/utils"

type NodeTone = "indigo" | "turquoise" | "pink" | "slate"

export type FleetNode = {
  id: string
  name: string
  label: string
  role: string
  network: string
  status: "online" | "watch" | "standby" | "offline"
  modelServer: string
  tone: NodeTone
  href?: string
  metrics: Array<{ label: string; value: string; tone?: NodeTone }>
  agents: string[]
  routing: string[]
  avoid: string[]
  actions: Array<{ label: string; icon: any; danger?: boolean }>
  queue: Array<{ title: string; detail: string; status: string }>
  logs: Array<{ time: string; line: string; tone?: NodeTone }>
}

const toneClasses: Record<NodeTone, string> = {
  indigo: "border-indigo-500/30 bg-indigo-500/5 text-indigo-100 shadow-indigo-500/20",
  turquoise: "border-turquoise-500/30 bg-turquoise-500/5 text-turquoise-50 shadow-turquoise-500/20",
  pink: "border-pink-500/30 bg-pink-500/5 text-pink-50 shadow-pink-500/20",
  slate: "border-slate-500/30 bg-slate-500/5 text-slate-100 shadow-slate-500/10",
}

const statusClasses: Record<FleetNode["status"], string> = {
  online: "bg-turquoise-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.5)]",
  watch: "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]",
  standby: "bg-indigo-600/40 text-indigo-400 shadow-inner",
  offline: "bg-pink-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]",
}

export const fleetNodes: FleetNode[] = [
  {
    id: "orchestrator",
    name: "orchestrator",
    label: "Grand_Lodge_Control",
    role: "Control plane / service host / tunnel manager / route coordinator",
    network: "LAN + Tailscale; public ingress through Cloudflare Tunnel",
    status: "online",
    modelServer: "Nexus Router / LiteLLM",
    tone: "indigo",
    href: "/fleet/orchestrator",
    metrics: [
      { label: "Stacks", value: "18", tone: "indigo" },
      { label: "Tunnels", value: "5", tone: "turquoise" },
      { label: "Routes", value: "42", tone: "pink" },
      { label: "Secrets", value: "INFISICAL", tone: "turquoise" },
    ],
    agents: ["Memory Manager Agent", "CRM Sync Agent", "Compliance Auditor Agent"],
    routing: [
      "Coordinate Docker stacks, Cloudflare Tunnel, Tailscale routes, and Nexus Router.",
      "Keep public surfaces Access-gated and worker endpoints private-only.",
    ],
    avoid: ["Do not expose raw workers or databases publicly."],
    actions: [
      { label: "RESTART_NODE", icon: RefreshCcw },
      { label: "SYNC_SECRETS", icon: LockKeyhole },
      { label: "DEPLOY_STACK", icon: Play },
      { label: "ROLLBACK", icon: AlertTriangle, danger: true },
    ],
    queue: [
      { title: "Cloudflared audit", detail: "Validate ingress map", status: "ready" },
      { title: "Nexus route check", detail: "Confirm MCP registry", status: "queued" },
    ],
    logs: [
      { time: "19:41", line: "Infisical secret injection validated.", tone: "turquoise" },
      { time: "19:39", line: "Oracle compose graph stable.", tone: "indigo" },
    ],
  },
  {
    id: "worker-rtx5090",
    name: "worker-rtx5090",
    label: "Arc_Reactor_Primary",
    role: "Burst reasoning / code generation / quote logic / heavy inference",
    network: "LAN + Tailscale",
    status: "online",
    modelServer: "vLLM (Hermes-3-405B)",
    tone: "indigo",
    href: "/fleet/worker-rtx5090",
    metrics: [
      { label: "VRAM used", value: "18.6 / 24 GB", tone: "indigo" },
      { label: "GPU util", value: "72%", tone: "turquoise" },
      { label: "Temp", value: "66 C", tone: "indigo" },
      { label: "Power", value: "310 W", tone: "pink" },
    ],
    agents: ["Dev/Code Agent", "Quote Generator Agent", "Complex Mortgage Reasoner"],
    routing: [
      "Accept complex quote generation and deep reasoning tasks.",
      "Promote tasks here when precision matters more than cost.",
    ],
    avoid: ["Avoid low-value drip parsing unless idle."],
    actions: [
      { label: "LAUNCH_NERVE", icon: Play },
      { label: "PROMOTE_TASK", icon: Zap },
      { label: "PAUSE_WORKER", icon: Pause },
    ],
    queue: [
      { title: "Scenario stress test", detail: "Multi-program comparison", status: "active" },
      { title: "Quote API refactor", detail: "Architecture lane", status: "queued" },
    ],
    logs: [
      { time: "19:44", line: "Heavy reasoning route reserved.", tone: "indigo" },
      { time: "19:38", line: "Model server reports vLLM active.", tone: "turquoise" },
    ],
  },
]

export function FleetControlPage() {
  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Fleet_Intelligence"
        title="Distributed Node Orchestration"
        description="Global cluster telemetry and containerized worker coordination across 4 physical nodes."
        meta={
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-lg">NODES_ACTIVE: 4</Badge>
            <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-lg">STATUS: OPTIMIZED</Badge>
          </div>
        }
        actions={
          <Button variant="outline" className="h-10 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] px-6 rounded-xl hover:bg-indigo-500/10">
             <RefreshCcw className="mr-2 size-3.5" /> TRIGGER_MESH_SYNC
          </Button>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Fleet Map */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <h2 className="text-xl font-black uppercase tracking-tighter text-foreground italic flex items-center gap-3">
                 <Network className="size-5 text-indigo-400" />
                 CLUSTER_TOPOLOGY_MAP
              </h2>
              <Badge variant="outline" className="bg-indigo-500/5 border-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">PHYSICAL_LAN_SYNC</Badge>
           </div>

           <div className="grid gap-6 md:grid-cols-2">
              {fleetNodes.map((node) => (
                <FleetNodeCard key={node.id} node={node} />
              ))}
           </div>
        </div>

        {/* Sidebar Ops */}
        <div className="space-y-12">
           <div className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border-b border-border/30 pb-3">ACTIVE_AGENT_SESSIONS</h3>
             <div className="space-y-4">
                {["Mortgage Assistant", "Lead Intake Parser", "Quote Generator Agent", "Memory Manager"].map((agent, i) => (
                  <div key={agent} className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between shadow-inner">
                     <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <Bot className="size-5" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-tight text-foreground">{agent}</p>
                     </div>
                     <Badge className="bg-turquoise-500/10 text-turquoise-400 border-none text-[8px] font-black px-2">ACTIVE</Badge>
                  </div>
                ))}
             </div>
           </div>

           <Card className="bg-card/40 border-indigo-500/30 overflow-hidden shadow-2xl rounded-[32px] p-8 space-y-6 border-t-2 border-t-indigo-500">
              <div className="flex items-center gap-3">
                 <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/30">
                    <Zap className="size-6 text-white" />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tighter italic text-foreground">Global_Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="h-10 text-[9px] font-black uppercase border-border/40 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">DRAIN_ALL</Button>
                 <Button variant="outline" className="h-10 text-[9px] font-black uppercase border-border/40 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">REBOOT_ALL</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

export function WorkerNodePage({ node }: { node: FleetNode }) {
  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex items-center gap-6">
        <Link href="/fleet" className="p-3 rounded-full bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-600 hover:text-white transition-all shadow-inner group">
          <ArrowLeft size={20} className="text-indigo-400 group-hover:text-white" />
        </Link>
        <div className="flex-1">
          <p className="text-turquoise-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Node_Forensics</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-foreground leading-none">
            {node.name} <span className="text-muted-foreground opacity-20 font-normal">/</span> <span className="text-indigo-400">{node.label}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <Badge className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-none shadow-lg", statusClasses[node.status])}>
             {node.status}
           </Badge>
           <Button variant="outline" className="h-11 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] px-6 rounded-xl">
             RE_CALIBRATE
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
         {node.metrics.map((m) => (
           <StatCard key={m.label} title={m.label} value={m.value} icon={Activity} color={m.tone || "indigo"} />
         ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-12">
           <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]">
              <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                   <Clock className="size-4" /> NODE_JOB_ORCHESTRATION
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {node.queue.map((job, idx) => (
                  <div key={idx} className="relative pl-10 pb-2 group/job">
                    <div className="rounded-2xl border border-border/30 bg-background/50 p-5 group-hover/job:bg-indigo-500/5 transition-all shadow-inner">
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-foreground">{job.title}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60 italic">{job.detail}</p>
                          </div>
                          <Badge className="bg-turquoise-500 text-black text-[8px] font-black px-2 py-0 border-none shadow-lg">{job.status}</Badge>
                       </div>
                    </div>
                  </div>
                ))}
              </CardContent>
           </Card>
        </div>

        <div className="space-y-12">
           <Card className="bg-card/40 border-indigo-500/30 overflow-hidden shadow-2xl rounded-[32px] p-8 space-y-6 border-t-2 border-t-indigo-500">
              <div className="flex items-center gap-3">
                 <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/30">
                    <History className="size-6 text-white" />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tighter italic text-foreground">Node_Trace</h3>
              </div>
              <div className="space-y-4">
                 {node.logs.map((log, i) => (
                   <div key={i} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l-2 border-indigo-500/30 pl-4">
                      <span className="text-indigo-400">{log.time}:</span> {log.line}
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

function FleetNodeCard({ node }: { node: FleetNode }) {
  return (
    <Link href={node.href ?? "/fleet"} className={cn("group bg-card/40 backdrop-blur-md border border-border/50 hover:border-indigo-500/30 p-6 rounded-[32px] transition-all shadow-xl border-t-2 overflow-hidden", toneClasses[node.tone])}>
      <div className="flex items-start justify-between mb-8">
         <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 shadow-inner group-hover:scale-105 transition-transform">
            <Cpu className="size-6 text-indigo-400" />
         </div>
         <Badge className={cn("text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none shadow-lg", statusClasses[node.status])}>
            {node.status}
         </Badge>
      </div>

      <div className="space-y-2">
         <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic group-hover:text-indigo-400 transition-colors">{node.name}</h3>
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-relaxed">{node.role}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/20">
         {node.metrics.slice(0, 2).map((m) => (
           <div key={m.label}>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{m.label}</p>
              <p className="text-sm font-black text-foreground uppercase tracking-tight italic">{m.value}</p>
           </div>
         ))}
      </div>
    </Link>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    turquoise: "text-turquoise-400 bg-turquoise-500/10 border-turquoise-500/20",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/20"
  };
  return (
    <Card className="bg-card/40 border-border/50 shadow-2xl overflow-hidden group hover:border-indigo-500/30 transition-all border-t-2 border-t-indigo-500/20 rounded-2xl">
      <CardHeader className="p-5 pb-2 bg-background/20 flex flex-row items-center justify-between border-b border-border/50">
        <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl border shadow-inner transition-transform group-hover:scale-110", colorMap[color])}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-3xl font-black text-foreground tracking-tighter italic group-hover:translate-x-1 transition-transform">{value}</div>
      </CardContent>
    </Card>
  );
}
