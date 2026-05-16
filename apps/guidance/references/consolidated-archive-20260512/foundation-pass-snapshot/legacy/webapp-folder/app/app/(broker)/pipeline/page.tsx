import { Activity, Award, Clock, DollarSign, TrendingUp, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const metrics = [
  { title: "Today's Leads", value: "12", icon: Users, detail: "+8% from last week" },
  { title: "Pipeline Value", value: "$24.5M", icon: DollarSign, detail: "+5% from last month" },
  { title: "Conversion Rate", value: "3.2%", icon: TrendingUp, detail: "-0.3% from last month" },
  { title: "Avg Processing Time", value: "18 days", icon: Clock, detail: "-2 days improvement" },
  { title: "Compliance Score", value: "98.5%", icon: Award, detail: "No critical issues" },
  { title: "Live Activity", value: "24", icon: Activity, detail: "Recent events in system" },
]

const recentActivity = [
  "New lead from RateHunter for $450,000 purchase loan",
  "Quote generated for Michael Chen at 6.875%",
  "Application submitted for Lisa Rodriguez FHA purchase",
  "Disclosure package delivered to David Kim",
]

export default function PipelinePage() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-turquoise-500 text-xs font-bold tracking-widest uppercase mb-1">Operational Insights</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-turquoise-400 italic">Pipeline Overview</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl font-medium uppercase tracking-tight opacity-70">
            Real-time operations dashboard monitoring lead flow, conversion metrics, and AI cluster throughput.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-3 py-1">FLEET_SYNC_ACTIVE</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ title, value, icon: Icon, detail }, index) => (
          <Card key={title} className={cn("bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl transition-all group border-t-2 overflow-hidden", index % 2 === 0 ? "border-t-indigo-500" : "border-t-turquoise-500")}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-background/20 border-b border-border/50">
              <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{title}</CardTitle>
              <div className={cn("p-1.5 rounded-lg border shadow-inner transition-transform group-hover:scale-110", index % 2 === 0 ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-turquoise-500/10 border-turquoise-500/20 text-turquoise-400")}>
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform">{value}</div>
              <p className="mt-3 text-[10px] font-black text-turquoise-400 bg-turquoise-500/5 inline-block px-2.5 py-1 rounded-full border border-turquoise-500/20 uppercase tracking-widest">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border border-border/50 shadow-2xl border-b-2 border-b-pink-500 overflow-hidden">
        <CardHeader className="bg-background/20 border-b border-border/50 p-6">
          <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
            <Activity className="size-4" />
            RECENT_SYSTEM_TRACE_ACTIVITY
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {recentActivity.map((item, i) => (
            <div key={item} className="flex items-center gap-5 rounded-2xl border border-border/30 bg-background/40 p-5 text-sm font-bold text-foreground hover:bg-indigo-500/5 transition-all border-l-2 border-l-turquoise-500 group shadow-inner">
              <div className="size-2 rounded-full bg-turquoise-500 animate-pulse shrink-0 shadow-[0_0_10px_rgba(20,184,166,1)]" />
              <div className="flex-1 uppercase tracking-tight text-xs font-black italic">{item}</div>
              <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">{i * 5 + 2}M_AGO</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
