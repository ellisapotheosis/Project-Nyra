'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@nyra/ui';
import {
  CheckCircle2, AlertCircle, AlertTriangle,
  Server, Zap, Activity, RotateCw,
  Container, Database, Code, Eye,
  ShieldCheck, Cpu, Network, Monitor,
  Settings, Terminal, History, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  cpu: number;
  memory: number;
  port: number;
  type: 'api' | 'crm' | 'memory' | 'workflow' | 'observability';
  description: string;
  lastHealth: string;
  container?: string;
}

interface WorkflowExecution {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  duration: string;
}

export default function OrchestratorPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [restarting, setRestarting] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const services: Service[] = [
    {
      id: 'nexus',
      name: 'Nexus Router',
      status: 'healthy',
      uptime: '23d 14h 32m',
      cpu: 12,
      memory: 45,
      port: 7000,
      type: 'api',
      description: 'LLM Gateway & Model Routing',
      lastHealth: '1s ago',
      container: 'nyra-nexus-router',
    },
    {
      id: 'twentycrm',
      name: 'TwentyCRM',
      status: 'healthy',
      uptime: '18d 3h 15m',
      cpu: 28,
      memory: 62,
      port: 3000,
      type: 'crm',
      description: 'Customer Relationship Management',
      lastHealth: '2s ago',
      container: 'nyra-twenty-crm',
    },
    {
      id: 'mempalace',
      name: 'Mempalace',
      status: 'healthy',
      uptime: '12d 8h 45m',
      cpu: 8,
      memory: 38,
      port: 8002,
      type: 'memory',
      description: 'Persistent Memory System',
      lastHealth: '1s ago',
      container: 'nyra-mempalace',
    },
    {
      id: 'activepieces',
      name: 'Activepieces',
      status: 'warning',
      uptime: '5d 2h 30m',
      cpu: 35,
      memory: 78,
      port: 5678,
      type: 'workflow',
      description: 'Campaign & Workflow Automation',
      lastHealth: '3s ago',
      container: 'nyra-activepieces',
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      status: 'healthy',
      uptime: '45d 12h 10m',
      cpu: 15,
      memory: 52,
      port: 9090,
      type: 'observability',
      description: 'Metrics Collection & Storage',
      lastHealth: '2s ago',
      container: 'nyra-prometheus',
    },
    {
      id: 'grafana',
      name: 'Grafana',
      status: 'healthy',
      uptime: '45d 10h 22m',
      cpu: 6,
      memory: 28,
      port: 3003,
      type: 'observability',
      description: 'Visualization & Dashboards',
      lastHealth: '1s ago',
      container: 'nyra-grafana',
    },
  ];

  const workflows: WorkflowExecution[] = [
    {
      id: '1',
      name: 'Daily Lead Sync',
      status: 'running',
      progress: 65,
      startTime: '2026-01-16 09:00 AM',
      duration: '4m 32s',
    },
    {
      id: '2',
      name: 'Compliance Audit',
      status: 'completed',
      progress: 100,
      startTime: '2026-01-16 08:00 AM',
      duration: '12m 15s',
    },
    {
      id: '3',
      name: 'Quote Generation',
      status: 'failed',
      progress: 45,
      startTime: '2026-01-16 07:30 AM',
      duration: '3m 42s',
    },
  ];

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 size={16} className="text-turquoise-400 shadow-[0_0_8px_rgba(20,184,166,1)]" />;
      case 'warning':
        return <AlertCircle size={16} className="text-indigo-400" />;
      case 'error':
        return <AlertTriangle size={16} className="text-pink-400 shadow-[0_0_8px_rgba(244,63,94,1)]" />;
    }
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-turquoise-400';
      case 'warning':
        return 'text-indigo-400';
      case 'error':
        return 'text-pink-400';
    }
  };

  const getServiceIcon = (type: Service['type']) => {
    const iconClass = 'size-5';
    switch (type) {
      case 'api':
        return <Zap className={iconClass + ' text-turquoise-400'} />;
      case 'crm':
        return <Database className={iconClass + ' text-indigo-400'} />;
      case 'memory':
        return <Code className={iconClass + ' text-pink-400'} />;
      case 'workflow':
        return <Activity className={iconClass + ' text-turquoise-400'} />;
      case 'observability':
        return <Eye className={iconClass + ' text-indigo-400'} />;
    }
  };

  const handleRestartService = async (serviceId: string, containerName: string) => {
    setRestarting(serviceId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRestarting(null);
    addToast('success', `PROTOCOL: ${containerName} restarted successfully.`);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20';
      case 'completed':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'failed':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  const clusterHealth = {
    healthy: services.filter(s => s.status === 'healthy').length,
    warning: services.filter(s => s.status === 'warning').length,
    error: services.filter(s => s.status === 'error').length,
    total: services.length,
  };

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Cluster_Operations"
        title="Orchestrator & Service Health"
        description="Global service mesh monitoring and containerized workflow coordination."
        meta={
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1">CONTROL_PLANE: ACTIVE</Badge>
            <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1">STATUS: STABLE</Badge>
          </div>
        }
        actions={
          <Button variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl shadow-inner hover:bg-indigo-500/10">
            <RotateCw className="mr-2 size-3.5" /> RE_CALIBRATE_MESH
          </Button>
        }
      />

      {/* Cluster Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Services" value={clusterHealth.total} icon={Server} color="indigo" />
        <StatCard title="Healthy" value={clusterHealth.healthy} icon={CheckCircle2} color="turquoise" />
        <StatCard title="Warnings" value={clusterHealth.warning} icon={AlertCircle} color="indigo" />
        <StatCard title="Errors" value={clusterHealth.error} icon={AlertTriangle} color="pink" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Services Grid */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <h2 className="text-xl font-black uppercase tracking-tighter text-foreground italic flex items-center gap-3">
                 <Container className="size-5 text-indigo-400" />
                 SERVICE_REGISTRY_TRACE
              </h2>
              <Badge variant="outline" className="bg-indigo-500/5 border-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">DOCKER_COMPOSE_MIRROR</Badge>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {services.map((service) => (
               <button
                 key={service.id}
                 onClick={() => setSelectedService(service)}
                 className="w-full text-left bg-card/40 backdrop-blur-md border border-border/50 hover:border-indigo-500/30 p-6 rounded-[24px] transition-all group shadow-xl border-t-2 border-t-indigo-500/20"
               >
                 <div className="flex items-start justify-between mb-6">
                   <div className="flex items-start gap-4">
                     <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 shadow-inner group-hover:scale-105 transition-transform">
                        {getServiceIcon(service.type)}
                     </div>
                     <div>
                       <p className="font-black text-foreground uppercase tracking-tight group-hover:text-indigo-400 transition-colors text-sm">{service.name}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60 italic">{service.description}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     {getStatusIcon(service.status)}
                     <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor(service.status)}`}>
                       {service.status}
                     </span>
                   </div>
                 </div>

                 {/* Resource Usage */}
                 <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                     <span>CPU_LOAD: {service.cpu}%</span>
                     <span>MEM_RESERVE: {service.memory}%</span>
                   </div>
                   <div className="flex gap-3">
                     <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-border/20">
                       <div className="h-full bg-gradient-to-r from-indigo-500 to-turquoise-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${service.cpu}%` }}></div>
                     </div>
                     <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-border/20">
                       <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: `${service.memory}%` }}></div>
                     </div>
                   </div>
                 </div>

                 {/* Service Info */}
                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                   <span className="flex items-center gap-2"><Network className="size-3" /> PORT:{service.port}</span>
                   <span className="flex items-center gap-2"><History className="size-3" /> UPTIME:{service.lastHealth}</span>
                 </div>
               </button>
             ))}
           </div>
        </div>

        {/* Sidebar: Active Workflows */}
        <div className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border-b border-border/30 pb-3">ACTIVE_WORKFLOWS</h3>
             <div className="space-y-4">
               {workflows.map((workflow) => (
                 <div key={workflow.id} className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-5 shadow-inner">
                   <div className="flex items-start justify-between">
                     <div>
                       <p className="text-xs font-black uppercase tracking-tight text-foreground">{workflow.name}</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">ID: {workflow.id.padStart(4, '0')}</p>
                     </div>
                     <Badge className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5", statusColor(workflow.status))}>
                       {workflow.status}
                     </Badge>
                   </div>
                   <div className="space-y-3">
                     <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                       <span>COMPLETION_INDEX</span>
                       <span className="text-turquoise-400">{workflow.progress}%</span>
                     </div>
                     <div className="w-full bg-black/40 rounded-full h-1 border border-border/30 overflow-hidden">
                       <div
                         className="bg-gradient-to-r from-indigo-500 to-turquoise-400 h-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                         style={{ width: `${workflow.progress}%` }}
                       ></div>
                     </div>
                     <div className="flex justify-between items-center pt-1">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">{workflow.startTime.split(' ')[1]} DISPATCH</p>
                        <p className="text-[8px] font-bold text-turquoise-400 uppercase tracking-widest">{workflow.duration}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <Card className="bg-card/40 border-pink-500/30 overflow-hidden shadow-2xl rounded-[24px] border-l-4 border-l-pink-500">
             <CardHeader className="bg-pink-500/5 p-6 border-b border-border/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400 flex items-center gap-2">
                  <AlertTriangle className="size-4" /> URGENT_ALERTS
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,1)]" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground">API_LATENCY_SPIKE_DETECTED</p>
                   </div>
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight opacity-60 leading-relaxed ml-4">
                     5090 WORKER NODE SHOWING 12% PERFORMANCE DEGRADATION IN REASONING SHARDS.
                   </p>
                   <Button variant="outline" className="w-full h-8 text-[8px] font-black uppercase border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-600 hover:text-white rounded-lg transition-all mt-2">RESOLVE_PROTOCOL</Button>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Service Detail Panel Overlay */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 lg:p-20">
          <Card className="bg-card border border-indigo-500/50 max-w-xl w-full rounded-[48px] shadow-[0_0_100px_-20px_rgba(99,102,241,0.4)] overflow-hidden flex flex-col border-t-2 border-t-indigo-500 animate-in zoom-in-95 duration-500">
            <header className="p-8 border-b border-border/40 bg-indigo-500/5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl border border-indigo-400/30">
                   {getServiceIcon(selectedService.type)}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter italic text-foreground">{selectedService.name}</CardTitle>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-40">System_Node_ID: {selectedService.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="size-12 rounded-full border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground hover:text-indigo-400 transition-colors"
              >
                <Eye className="size-6" />
              </button>
            </header>
            <CardContent className="p-10 space-y-10">
              <div className="p-8 rounded-[32px] bg-background/50 border border-border/30 shadow-inner">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">NODE_DESCRIPTION:</p>
                <p className="text-lg font-black text-foreground uppercase tracking-tight leading-relaxed italic">{selectedService.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-2">STATUS_INDEX</p>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedService.status)}
                    <span className={`text-xl font-black uppercase tracking-tight ${getStatusColor(selectedService.status)}`}>
                      {selectedService.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-2">NETWORK_PORT</p>
                  <p className="text-xl font-black text-turquoise-400 italic">:{selectedService.port}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 shadow-inner">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Cpu className="size-3" /> CPU_LOAD</p>
                  <p className="text-2xl font-black text-foreground italic">{selectedService.cpu}%</p>
                </div>
                <div className="p-6 rounded-2xl bg-turquoise-500/5 border border-turquoise-500/10 shadow-inner">
                  <p className="text-[9px] font-black text-turquoise-400 uppercase tracking-widest mb-2 flex items-center gap-2"><History className="size-3" /> MEM_USED</p>
                  <p className="text-2xl font-black text-foreground italic">{selectedService.memory}%</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-3">PERSISTENT_UPTIME</p>
                <p className="text-sm font-black text-turquoise-400 bg-turquoise-500/5 px-4 py-2 rounded-xl border border-turquoise-500/20 inline-block uppercase tracking-widest shadow-inner">{selectedService.uptime}</p>
              </div>
            </CardContent>

            <footer className="p-8 bg-background/40 border-t border-border/40 flex flex-col gap-5">
              {selectedService.container && (
                <Button
                  onClick={() => {
                    handleRestartService(selectedService.id, selectedService.container!);
                    setSelectedService(null);
                  }}
                  disabled={restarting === selectedService.id}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-indigo-500/40 border border-indigo-400/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCw size={18} className={cn("mr-3", restarting === selectedService.id ? 'animate-spin' : '')} />
                  {restarting === selectedService.id ? 'REBOOTING_CONTAINER...' : 'RESTART_SERVICE_NODE'}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setSelectedService(null)} className="w-full font-black uppercase tracking-widest text-[9px] text-muted-foreground hover:text-foreground">DISMISS_INSPECTOR</Button>
            </footer>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 border-t-indigo-500",
    turquoise: "text-turquoise-400 border-t-turquoise-500",
    pink: "text-pink-400 border-t-pink-500"
  };
  return (
    <Card className={cn("bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden group hover:border-indigo-500/30 transition-all rounded-[24px]", colorMap[color])}>
      <CardHeader className="p-5 pb-2 bg-background/20 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{title}</CardTitle>
        <div className={cn("p-1.5 rounded-lg border shadow-inner",
          color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
          color === 'turquoise' ? 'bg-turquoise-500/10 border-turquoise-500/20 text-turquoise-400' :
          'bg-pink-500/10 border-pink-500/20 text-pink-400'
        )}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-3xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform italic">{value}</p>
      </CardContent>
    </Card>
  );
}
