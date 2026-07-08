import { CalendarClock, DollarSign, FileText, UserRound } from "lucide-react";

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

export default async function ApplicationsPage() {
  const { applications, source } = await getCrmWorkspaceData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Consolidated application visibility from the mortgage CRM surface, now
          inside the main internal webapp.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline">Source: {source}</Badge>
        <Badge variant="secondary">
          {applications.length} active applications
        </Badge>
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed">
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
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id} className="border-border/70 bg-card/80">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <UserRound className="size-5 text-primary" />
                    {application.borrower}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.product}
                  </p>
                </div>
                <Badge>{application.status}</Badge>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="size-4" />
                    Loan amount
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {currency(application.amount)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="size-4" />
                    Milestone
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {application.milestone}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4" />
                    Updated
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatDate(application.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
