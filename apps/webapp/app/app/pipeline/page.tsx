import { Activity, Award, Clock, DollarSign, TrendingUp, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pipeline Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Operations dashboard adapted from the admin prototype and reframed as a first-class route in the main app.
        </p>
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
