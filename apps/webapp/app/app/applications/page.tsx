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

export default async function ApplicationsPage() {
  noStore()
  const { applications, source } = await getCrmWorkspaceData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Consolidated application visibility from the mortgage CRM surface, now inside the main internal webapp.
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-primary/80">Source: {source}</p>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold">{application.borrower}</p>
                <p className="text-sm text-muted-foreground">
                  {application.product} • {currency(application.amount)}
                </p>
              </div>
              <div className="grid gap-1 text-sm lg:text-right">
                <p>{application.status}</p>
                <p className="text-muted-foreground">{application.milestone}</p>
                <p className="text-muted-foreground">LO: {application.loanOfficer}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
