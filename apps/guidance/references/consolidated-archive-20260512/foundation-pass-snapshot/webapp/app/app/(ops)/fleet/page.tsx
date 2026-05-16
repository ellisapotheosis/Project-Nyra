'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bot, Cpu, Monitor, Zap, ExternalLink, Activity } from 'lucide-react';

const WORKERS = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    role: 'Control Plane',
    hardware: 'Local WSL2 (16GB RAM)',
    status: 'ONLINE',
    openclaw: 'http://localhost:8001',
    nerve: 'http://localhost:18789',
    color: 'border-primary'
  },
  {
    id: 'rtx5090',
    name: 'Worker RTX 5090',
    role: 'Heavy Reasoning / Burst',
    hardware: '32GB VRAM / vLLM',
    status: 'ONLINE',
    openclaw: 'http://worker-rtx5090.trex-fiordland.ts.net:8001',
    nerve: 'http://worker-rtx5090.trex-fiordland.ts.net:18789',
    color: 'border-primary'
  },
  {
    id: 'rtx3090ti',
    name: 'Worker RTX 3090 Ti',
    role: 'Steady-state / Drip Ops',
    hardware: '24GB VRAM / vLLM',
    status: 'ONLINE',
    openclaw: 'http://worker-rtx3090ti.trex-fiordland.ts.net:8001',
    nerve: 'http://worker-rtx3090ti.trex-fiordland.ts.net:18789',
    color: 'border-accent'
  },
  {
    id: 'rtx3060',
    name: 'Worker RTX 3060',
    role: 'Utility / PicoClaw Test',
    hardware: '6GB VRAM / Ollama',
    status: 'ONLINE',
    openclaw: 'http://worker-rtx3060.trex-fiordland.ts.net:8001',
    nerve: 'http://worker-rtx3060.trex-fiordland.ts.net:18789',
    picoclaw: 'http://worker-rtx3060.trex-fiordland.ts.net:8002',
    color: 'border-emerald-500'
  }
];

export default function FleetPage() {
  return (
    <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">
            Compute Plane
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400 italic">
            AI Fleet Operations
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Real-time status of the local AI cluster and assistant cockpits.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1 gap-1 font-black text-[10px] uppercase tracking-widest">
            <Activity className="size-3" />
            Cluster_Healthy
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {WORKERS.map((worker) => (
          <Card key={worker.id} className={`bg-card/40 backdrop-blur-md border shadow-2xl transition-all hover:border-primary/30 group border-t-2 ${worker.color}`}>
            <CardHeader className="bg-background/20 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                <Cpu className="size-4 text-primary" />
                {worker.name}
              </CardTitle>
              <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{worker.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-black text-[9px] uppercase">
                {worker.status}
              </Badge>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">{worker.hardware}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <a href={worker.openclaw} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg border-primary/20 bg-primary/5 text-[9px] font-black uppercase hover:bg-primary/10 transition-all")}>
                  OpenClaw
                  <ExternalLink className="ml-1.5 size-2.5 text-primary" />
                </a>
                <a href={worker.nerve} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-lg border-primary/20 bg-primary/5 text-[9px] font-black uppercase hover:bg-primary/10 transition-all")}>
                  Nerve
                  <ExternalLink className="ml-1.5 size-2.5 text-primary" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="bg-card/40 border-destructive/30 overflow-hidden shadow-2xl backdrop-blur-md border-t-2 border-t-destructive">
          <CardHeader className="bg-destructive/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-destructive">
              <Zap className="size-4" />
              Workflow_Control_Sentinel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 shadow-inner group hover:bg-background/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                  <Activity className="size-4" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">ClawTeam</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Multi-agent coordination</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-black font-black text-[9px] uppercase tracking-widest px-2 py-0.5">ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 shadow-inner group hover:bg-background/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Activity className="size-4" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">Paperclip</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Automated goal alignment</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-black font-black text-[9px] uppercase tracking-widest px-2 py-0.5">ACTIVE</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-emerald-500/30 overflow-hidden shadow-2xl backdrop-blur-md border-t-2 border-t-emerald-500">
          <CardHeader className="bg-emerald-500/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              <Bot className="size-4" />
              Orchestration_Layer_Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <ServiceRow name="Letta" desc="Context & Memory Orchestrator" icon={Activity} color="success" />
            <ServiceRow name="Nexus Router" desc="Tool & Model Ingress" icon={Activity} color="primary" />
            <ServiceRow name="LLXPRT Bridge" desc="Subscription CLI Ingress" icon={Monitor} color="primary" />
            <ServiceRow name="Pocket TTS" desc="Kyutai Voice Engine" icon={Activity} color="danger" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 border-primary/30 overflow-hidden shadow-2xl border-b-2 border-b-primary">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Activity className="size-4" />
            Global_Routing_Logic_Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <PolicyBox title="Burst Capacity" desc="If the 5090 is at peak load, LiteLLM automatically spills heavy reasoning tasks to the 3090 Ti worker." />
          <PolicyBox title="Lightweight Failover" desc="The 3060 (Ollama) handles embedding, classification, and summarization, freeing up larger VRAM pools." />
          <PolicyBox title="Control Plane" desc="Orchestrator manages the Nexus Router tool registry and synchronizes memory across the fleet." />
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceRow({ name, desc, icon: Icon, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    success: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    danger: "text-destructive bg-destructive/10 border-destructive/20"
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20 shadow-inner group hover:bg-background/80 transition-all">
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-lg border", colorMap[color])}>
          <Icon className="size-3.5" />
        </div>
        <div>
          <p className="font-black text-xs uppercase tracking-tight">{name}</p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{desc}</p>
        </div>
      </div>
      <Badge className="bg-emerald-500 text-black font-black text-[8px] px-1.5 py-0">ONLINE</Badge>
    </div>
  );
}

function PolicyBox({ title, desc }: any) {
  return (
    <div className="space-y-3">
      <h3 className="font-black text-emerald-300 text-xs uppercase tracking-widest flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-emerald-500" />
        {title}
      </h3>
      <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight opacity-70">
        {desc}
      </p>
    </div>
  );
}
