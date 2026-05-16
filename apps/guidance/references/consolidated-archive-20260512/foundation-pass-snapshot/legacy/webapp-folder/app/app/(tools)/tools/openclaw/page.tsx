'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Zap,
  Terminal,
  ShieldAlert,
  Activity,
  Cpu,
  Server,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  ExternalLink
} from 'lucide-react';

export default function OpenClawToolPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'ACTIVE' | 'ERROR'>('IDLE');

  const testRouting = async () => {
    setIsLoading(true);
    setStatus('ACTIVE');
    try {
      // Simulate calling the Nexus Router
      setTimeout(() => {
        setResponse({
          workerId: "worker-rtx5090",
          model: "Llama-3-70B-Instruct",
          latency: "45ms",
          riskEvaluated: "READ_ONLY",
          status: "SUCCESS"
        });
        setIsLoading(false);
      }, 1000);
    } catch (e) {
      setStatus('ERROR');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Agent Ingress</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent italic">OpenClaw Tooling</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Internal diagnostic surface for the Nexus Router and multi-agent coordination bridge.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px]">UPSTREAM: CONNECTED</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diagnostic Input */}
        <Card className="lg:col-span-1 border-border/50 bg-card/40 backdrop-blur-md shadow-2xl border-t-2 border-t-primary">
          <CardHeader>
            <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Terminal className="size-5 text-primary" />
              Task Ingress
            </CardTitle>
            <CardDescription className="text-xs uppercase font-bold text-muted-foreground">Test the routing & classification logic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Natural Language Prompt</label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Ingest lead and generate refi quote..."
                className="bg-background/40 border-border/50 h-12 font-bold rounded-lg"
              />
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest h-12 rounded-lg shadow-lg shadow-primary/20"
              onClick={testRouting}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <RefreshCcw className="mr-2 size-5 animate-spin" /> : <Zap className="mr-2 size-5" />}
              Dispatch Protocol
            </Button>
          </CardContent>
          <CardFooter className="bg-primary/5 border-t border-primary/10 p-4">
             <div className="flex items-center gap-2 text-xs font-bold text-primary">
               <ShieldAlert className="size-4 text-destructive" />
               SYSTEM_SANDBOX_ACTIVE
             </div>
          </CardFooter>
        </Card>

        {/* Response / Trace */}
        <Card className="lg:col-span-2 border-border/50 bg-black/40 backdrop-blur-md shadow-2xl relative overflow-hidden min-h-[400px]">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
          <CardHeader className="border-b border-border/50 bg-background/20">
            <CardTitle className="text-sm font-black text-emerald-300 uppercase tracking-widest flex items-center gap-2">
              <Activity className="size-4" />
              Trace_Response
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full min-h-[350px]">
            {!response && !isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                <Bot className="size-16 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">AWAITING_INGRESS</p>
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 animate-pulse">Routing via Nexus...</p>
              </div>
            ) : (
              <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 shadow-inner">
                     <p className="text-[10px] font-black text-primary uppercase mb-1">Target Worker</p>
                     <p className="text-lg font-black text-foreground">{response.workerId}</p>
                   </div>
                   <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 shadow-inner">
                     <p className="text-[10px] font-black text-emerald-300 uppercase mb-1">Inference Model</p>
                     <p className="text-lg font-black text-foreground">{response.model}</p>
                   </div>
                </div>

                <div className="p-6 rounded-lg bg-background/60 border border-border/50 font-mono text-[11px] leading-relaxed shadow-2xl border-l-4 border-l-primary">
                  <div className="flex items-center gap-2 text-primary mb-4 font-black">
                    <CheckCircle2 className="size-4" /> [AGENT_LOGS] Protocol success.
                  </div>
                  <pre className="text-muted-foreground whitespace-pre-wrap">
{`{
  "traceId": "nx-8842-qaz",
  "performer": "AGENT_NYRA",
  "risk": "${response.riskEvaluated}",
  "actions": [
    "CLASSIFY_INTENT",
    "FETCH_MEM0_CONTEXT",
    "DISPATCH_TO_VLLM"
  ],
  "latency": "${response.latency}"
}`}
                  </pre>
                </div>

                <Button variant="outline" className="w-full border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] h-10">
                  View Full Audit Log in CRM <ExternalLink className="ml-2 size-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cluster Node Visualizer (Mini) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Orchestrator', '5090_Worker', '3090_Ti_Worker', '3060_Worker'].map((node) => (
          <div key={node} className="p-4 rounded-lg border border-border/40 bg-card/20 backdrop-blur-sm flex items-center justify-between group hover:border-primary/30 transition-all shadow-lg">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-background/50 border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
                 <Server className="size-4" />
               </div>
               <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">{node}</span>
             </div>
             <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
