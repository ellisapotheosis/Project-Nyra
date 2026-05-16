import { CalendarClock, DollarSign, FileText, UserRound, ArrowRight } from "lucide-react"

import { Badge, Button } from "@nyra/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui"
import { getCrmWorkspaceData } from "@/lib/crm-data"
import { cn } from "@/lib/utils"

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
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-turquoise-400 text-[10px] font-black tracking-[0.4em] uppercase mb-1">Registry_Flow</p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-turquoise-400 italic uppercase">Active_Loan_Applications</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl font-medium uppercase tracking-tight text-xs opacity-60">
            Consolidated loan application visibility pulling live milestones from TwentyCRM ledger.
          </p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-lg">SOURCE: {source.toUpperCase()}</Badge>
          <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-lg shadow-lg shadow-turquoise-500/20">{applications.length} ACTIVE_RECORDS</Badge>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed border-indigo-500/20 bg-indigo-500/5 min-h-[400px] flex items-center justify-center rounded-[48px] shadow-inner">
          <CardContent className="flex flex-col items-center justify-center p-20 text-center space-y-8">
            <div className="rounded-3xl bg-background/50 border border-indigo-500/20 p-8 shadow-2xl relative group">
               <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
               <FileText className="h-16 w-16 text-indigo-400 relative z-10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic">No applications detected</h3>
              <p className="max-w-sm text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                Ready for CRM data streaming. Ensure the TwentyCRM custom-objects integration is authenticated.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {applications.map((application) => (
            <Card key={application.id} className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl hover:border-indigo-500/30 transition-all group overflow-hidden border-t-2 border-t-indigo-500 rounded-[32px]">
              <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 bg-background/20 p-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-indigo-600 shadow-xl border border-indigo-400/30 group-hover:scale-105 transition-transform">
                    <UserRound className="size-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tighter text-foreground group-hover:text-indigo-400 transition-colors uppercase italic">
                      {application.borrower}
                    </CardTitle>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">PROD_REF: {application.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <Badge className="bg-turquoise-500 text-black font-black text-[10px] px-4 py-1.5 uppercase tracking-widest rounded-lg">
                     {application.status}
                   </Badge>
                   <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-500/10 text-muted-foreground">
                      <ArrowRight className="size-5" />
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-8 p-10 sm:grid-cols-3 bg-indigo-500/5">
                <div className="rounded-[24px] border border-border/30 bg-background/50 p-6 shadow-xl group-hover:bg-background/80 transition-colors border-l-4 border-l-turquoise-500">
                  <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    <DollarSign className="size-3.5 text-turquoise-400" />
                    LOAN_VOLUME
                  </p>
                  <p className="text-3xl font-black text-foreground tracking-tighter italic">{currency(application.amount)}</p>
                </div>
                <div className="rounded-[24px] border border-border/30 bg-background/50 p-6 shadow-xl group-hover:bg-background/80 transition-colors border-l-4 border-l-indigo-500">
                  <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    <FileText className="size-3.5 text-indigo-400" />
                    CURRENT_MILESTONE
                  </p>
                  <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic">{application.milestone}</p>
                </div>
                <div className="rounded-[24px] border border-border/30 bg-background/50 p-6 shadow-xl group-hover:bg-background/80 transition-colors border-l-4 border-l-pink-500">
                  <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    <CalendarClock className="size-3.5 text-pink-400" />
                    LATEST_TRACE_SYNC
                  </p>
                  <p className="text-3xl font-black text-foreground tracking-tighter italic">{formatDate(application.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
