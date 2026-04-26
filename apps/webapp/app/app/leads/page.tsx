import { Mail, MapPin, Phone, Star } from "lucide-react"
import { unstable_noStore as noStore } from "next/cache"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCrmWorkspaceData } from "@/lib/crm-data"

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function LeadsPage() {
  noStore()
  const { leads, source } = await getCrmWorkspaceData()
  const qualifiedCount = leads.filter((lead) => lead.stage === "Qualified").length
  const averageLoan = Math.round(leads.reduce((sum, lead) => sum + lead.loanAmount, 0) / leads.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Lead Management</h1>
        <p className="mt-2 text-muted-foreground">
          Unified lead view pulling from the active CRM bridge with mock fallback when the upstream is offline.
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-primary/80">Source: {source}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{leads.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Qualified</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{qualifiedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Average Loan Size</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{currency(averageLoan)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="border-border/70 bg-card/80">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                  {lead.firstName[0]}
                  {lead.lastName[0]}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-lg font-semibold">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lead.loanPurpose} • {currency(lead.loanAmount)} • {lead.stage}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-4" />
                      {lead.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-4" />
                      {lead.phone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {lead.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 text-sm lg:text-right">
                <span className="inline-flex items-center gap-1 text-primary">
                  <Star className="size-4" />
                  {lead.creditBand} credit band
                </span>
                <p className="text-muted-foreground">Campaign: {lead.campaignId}</p>
                <p className="text-muted-foreground">Source: {lead.source}</p>
                <p className="text-muted-foreground">Next touch: {lead.nextTouch}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
