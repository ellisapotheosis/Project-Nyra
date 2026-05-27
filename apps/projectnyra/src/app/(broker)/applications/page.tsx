import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  FolderClock,
  Landmark,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrmWorkspaceData } from "@/lib/crm-data";

export const dynamic = "force-dynamic";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const stageOrder = [
  "Application",
  "Document collection",
  "Conditions review",
  "Underwriting",
  "Clear to close",
  "Funded",
];

const documentQueues = [
  ["Income", "2 received", "W-2 and paystub uploaded"],
  ["Assets", "1 missing", "Latest bank statement required"],
  ["Identity", "complete", "Borrower ID verified"],
  ["Property", "pending", "Insurance binder not received"],
];

export default async function ApplicationsPage() {
  const { applications, source } = await getCrmWorkspaceData();
  const totalVolume = applications.reduce((sum, app) => sum + app.amount, 0);
  const underwriting = applications.filter((app) =>
    app.status.toLowerCase().includes("underwriting")
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-turquoise-400">
            <FolderClock className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Loan Workflow
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Applications
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Broker-facing application state, document readiness, milestone
            movement, and LendingPad-facing status. This surface reflects CRM
            contracts and does not imply direct LOS mutation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Source: {source}</Badge>
          <Badge className="bg-indigo-500/15 text-indigo-300">
            {applications.length} active files
          </Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="size-4 text-turquoise-400" />
              Active volume
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {currency(totalVolume)}
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardCheck className="size-4 text-indigo-400" />
              Underwriting
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {underwriting}
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-pink-400" />
              Compliance posture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Gated</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disclosures and borrower sends require service approval.
            </p>
          </CardContent>
        </Card>
      </section>

      {applications.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-20">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FileText className="h-10 w-10" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-xl font-bold">No applications found</h3>
              <p className="max-w-sm text-muted-foreground">
                Application tracking is ready for CRM data once the Twenty
                integration returns records.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-5">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="overflow-hidden border-border/40 bg-card/40"
            >
              <CardHeader className="border-b border-border/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <UserRound className="size-5 text-primary" />
                      {application.borrower}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.product} file owned by{" "}
                      {application.loanOfficer}
                    </p>
                  </div>
                  <Badge className="bg-turquoise-500/15 text-turquoise-300">
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="size-4" />
                        Loan amount
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {currency(application.amount)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Landmark className="size-4" />
                        Milestone
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {application.milestone}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/40 p-4">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <CalendarClock className="size-4" />
                        Updated
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {formatDate(application.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/30 p-4">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Milestone projection
                    </p>
                    <div className="grid gap-2 md:grid-cols-6">
                      {stageOrder.map((stage) => {
                        const active =
                          application.status === stage ||
                          application.milestone === stage;
                        return (
                          <div
                            key={stage}
                            className={`rounded-lg border p-3 text-xs ${
                              active
                                ? "border-primary/60 bg-primary/15 text-foreground"
                                : "border-border/30 bg-card/20 text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="mb-2 size-4" />
                            {stage}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <aside className="rounded-xl border border-border/40 bg-background/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Document readiness
                  </p>
                  <div className="mt-4 space-y-3">
                    {documentQueues.map(([label, status, detail]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-border/30 bg-card/30 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{label}</p>
                          <Badge variant="outline" className="text-[9px]">
                            {status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </aside>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
