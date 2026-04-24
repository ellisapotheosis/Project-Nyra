import { Activity, FileText, Target, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { applications, crmOverview, leads } from "@/lib/mock-data"

export default function CrmPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">CRM Mirror</h1>
        <p className="mt-2 text-muted-foreground">
          This page replaces the separate mortgage CRM prototype with an internal overview route inside the main webapp.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="size-4" />
              Active Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{crmOverview.pipelineValue}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" />
              Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{crmOverview.activeLeads}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="size-4" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{crmOverview.activeApplications}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="size-4" />
              Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{crmOverview.conversionRate}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Average Cycle</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{crmOverview.averageCycle}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Leads Feeding the Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="font-medium">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lead.loanPurpose} • {lead.stage} • {lead.source}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{application.borrower}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.product} • ${application.amount.toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {application.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{application.milestone}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
