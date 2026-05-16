import Link from "next/link";
import { Activity, Settings, ShieldCheck } from "lucide-react";

import { PageHeader } from "@nyra/ui";
import { ComplianceBadge } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { cn } from "@/lib/utils";

const adminCards = [
  {
    href: "/admin/integrations",
    title: "Integration Health",
    description: "Read-only status for CRM, quotes, campaigns, assistant, memory, workflow engines, and workers.",
    icon: Activity,
  },
  {
    href: "/crm/settings",
    title: "CRM Mapping",
    description: "Twenty object mapping, sync posture, and service boundary checklist.",
    icon: ShieldCheck,
  },
  {
    href: "/settings",
    title: "Runtime Settings",
    description: "Environment readiness and operational configuration reminders.",
    icon: Settings,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-12 p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        eyebrow="Registry_Control"
        title="Admin Command Hub"
        description="Internal control surfaces for configuration, integration health, and service-boundary review."
        meta={
          <div className="flex gap-2">
            <ComplianceBadge label="ACCESS_GATED" state="warning" className="bg-pink-500/10 text-pink-400 border-pink-500/20" />
            <ComplianceBadge label="READ_ONLY_POSTURE" state="clear" className="bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20" />
          </div>
        }
      />

      <div className="grid gap-8 md:grid-cols-3">
        {adminCards.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl transition-all hover:border-indigo-500/30 border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]">
              <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8 pb-6">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Icon className="size-6" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors mt-6">{title}</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-[11px] font-bold leading-relaxed text-muted-foreground uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{description}</p>
                <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all">
                   INITIATE_UPLINK →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* System Status Summary */}
      <Card className="bg-card/20 backdrop-blur-sm border border-border/50 shadow-2xl rounded-[32px] border-b-2 border-b-turquoise-500 overflow-hidden">
        <CardHeader className="bg-background/20 border-b border-border/50 p-8">
           <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-turquoise-400 flex items-center gap-3">
             <Activity className="size-4" />
             OPERATIONAL_LIFECYCLE_TRACE
           </CardTitle>
        </CardHeader>
        <CardContent className="p-10 grid gap-10 md:grid-cols-4">
           <SystemDetail label="Cluster Topology" value="4_NODES_ACTIVE" color="indigo" />
           <SystemDetail label="Secret State" value="INFISICAL_SYNCED" color="turquoise" />
           <SystemDetail label="CRM Endpoint" value="TWENTY_GRAPHQL" color="indigo" />
           <SystemDetail label="Governance" value="PAPERCLIP_LOCKED" color="pink" />
        </CardContent>
      </Card>
    </div>
  );
}

function SystemDetail({ label, value, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400",
    turquoise: "text-turquoise-400",
    pink: "text-pink-400"
  };
  return (
    <div className="space-y-2 group">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">{label}</p>
      <div className="flex items-center gap-2">
         <div className={cn("size-1.5 rounded-full bg-current animate-pulse shadow-current shadow-[0_0_8px]", colorMap[color])} />
         <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:translate-x-1 transition-transform cursor-default">{value}</p>
      </div>
    </div>
  )
}
