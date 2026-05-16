import { CalendarClock, DollarSign, FileText, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCrmWorkspaceData } from "@/lib/crm-data"

export const dynamic = "force-dynamic"

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function ApplicationsPage() {
  const { applications, source } = await getCrmWorkspaceData()

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Loan Flow</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Applications</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Consolidated loan application visibility pulling live milestones from TwentyCRM.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px]">SOURCE: {source.toUpperCase()}</Badge>
          <Badge className="bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest">{applications.length} ACTIVE_APPS</Badge>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed border-primary/20 bg-primary/5 min-h-[300px] flex items-center justify-center rounded-lg">
          <CardContent className="flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="rounded-lg bg-background/50 border border-primary/20 p-5 shadow-2xl">
              <FileText className="h-12 w-12 text-primary/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">No applications detected</h3>
              <p className="max-w-sm text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                Ready for CRM data streaming. Ensure the mortgage integration is authenticated.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="bg-card/40 backdrop-blur-md border border-border/50 shadow-xl hover:border-primary/30 transition-all group overflow-hidden border-t-2 border-t-primary">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/50 bg-background/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors uppercase">
                      {application.borrower}
                    </CardTitle>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{application.product}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-black font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                  {application.status}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 text-sm sm:grid-cols-3 bg-primary/5">
                <div className="rounded-lg border border-border/30 bg-background/40 p-5 shadow-lg group-hover:bg-background/60 transition-colors border-l-2 border-l-emerald-500">
                  <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    <DollarSign className="size-3.5 text-emerald-300" />
                    Loan_Volume
                  </p>
                  <p className="text-2xl font-black text-foreground">{currency(application.amount)}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/40 p-5 shadow-lg group-hover:bg-background/60 transition-colors border-l-2 border-l-primary">
                  <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    <FileText className="size-3.5 text-primary" />
                    Current_Milestone
                  </p>
                  <p className="text-2xl font-black text-foreground uppercase tracking-tighter">{application.milestone}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/40 p-5 shadow-lg group-hover:bg-background/60 transition-colors border-l-2 border-l-destructive">
                  <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                    <CalendarClock className="size-3.5 text-destructive" />
                    Last_Sync
                  </p>
                  <p className="text-2xl font-black text-foreground">{formatDate(application.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
