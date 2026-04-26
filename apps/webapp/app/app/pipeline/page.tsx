import { Activity, Award, Clock, DollarSign, TrendingUp, Users } from "lucide-react"
import { unstable_noStore as noStore } from "next/cache"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCrmWorkspaceData } from "@/lib/crm-data"

export default async function PipelinePage() {
  noStore()
  const { applications, crmOverview, leads, recentActivity, source } = await getCrmWorkspaceData()
  const metrics = [
    { title: "Today's Leads", value: String(leads.length), icon: Users, detail: `Source: ${source}` },
    { title: "Pipeline Value", value: crmOverview.pipelineValue, icon: DollarSign, detail: "Derived from CRM applications" },
    { title: "Conversion Rate", value: crmOverview.conversionRate, icon: TrendingUp, detail: "Lead-to-qualified ratio" },
    { title: "Avg Processing Time", value: crmOverview.averageCycle, icon: Clock, detail: "Calculated from application updates" },
    { title: "Compliance Score", value: "98.5%", icon: Award, detail: "Static until compliance service is wired in" },
    { title: "Live Activity", value: String(recentActivity.length), icon: Activity, detail: `${applications.length} active application records` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pipeline Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Operations dashboard adapted from the admin prototype and reframed as a first-class route in the main app.
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-primary/80">Source: {source}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ title, value, icon: Icon, detail }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{value}</div>
              <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item} className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
