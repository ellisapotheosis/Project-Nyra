import type { ComponentType } from "react"
import { AlertTriangle, Award, Calculator, CheckCircle, Clock, DollarSign, TrendingUp, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const dashboardMetrics = [
  { title: "Today's Leads", value: "12", change: "+8%", icon: Users },
  { title: "Active Quotes", value: "847", change: "+12%", icon: Calculator },
  { title: "Pipeline Value", value: "$24.5M", change: "+5%", icon: DollarSign },
  { title: "Conversion Rate", value: "3.2%", change: "-0.3%", icon: TrendingUp },
  { title: "Avg Processing Time", value: "18 days", change: "-2 days", icon: Clock },
  { title: "Compliance Score", value: "98.5%", change: "+0.5%", icon: Award },
]

const recentActivity = [
  {
    title: "New lead from RateHunter",
    description: "Sarah Johnson · $450,000 purchase loan",
    time: "5 minutes ago",
    status: "new",
  },
  {
    title: "Quote generated",
    description: "Michael Chen · 30Y Conventional at 6.875%",
    time: "12 minutes ago",
    status: "completed",
  },
  {
    title: "Application submitted",
    description: "Lisa Rodriguez · $325,000 FHA purchase",
    time: "18 minutes ago",
    status: "processing",
  },
  {
    title: "Disclosure delivered",
    description: "TILA-RESPA LE sent to David Kim",
    time: "32 minutes ago",
    status: "completed",
  },
]

const systemAlerts = [
  {
    title: "Rate lock expiring soon",
    description: "3 loans have rate locks expiring within 7 days",
    action: "Review locks",
  },
  {
    title: "Campaign performance",
    description: "Email campaign #47 is holding a 35% open rate",
    action: "View details",
  },
]

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-white/10 bg-white/5 shadow-lg backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className="size-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-white">{value}</div>
        <p className="mt-1 text-xs text-emerald-300">{change} from last month</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Welcome back, Ellis</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            The original admin dashboard has been merged into the shared app as `/admin`, while keeping a distinct
            operations-oriented visual treatment.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentActivity.map((activity) => (
              <div key={`${activity.title}-${activity.time}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  {activity.status === "completed" ? (
                    <CheckCircle className="mt-0.5 size-4 text-emerald-400" />
                  ) : activity.status === "processing" ? (
                    <Clock className="mt-0.5 size-4 text-amber-300" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-4 text-cyan-300" />
                  )}
                  <div>
                    <p className="font-medium text-white">{activity.title}</p>
                    <p className="text-sm text-slate-400">{activity.description}</p>
                    <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-white/10 bg-white/5 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {systemAlerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{alert.title}</p>
                      <p className="text-sm text-slate-400">{alert.description}</p>
                    </div>
                    <button className="text-sm font-medium text-cyan-300">{alert.action}</button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                "View Leads",
                "Quote Desk",
                "Campaigns",
                "Compliance",
              ].map((item) => (
                <button
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-sm font-medium text-slate-200 transition hover:bg-black/30"
                >
                  {item}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
