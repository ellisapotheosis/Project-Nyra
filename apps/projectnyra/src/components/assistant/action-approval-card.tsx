import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

import { Button } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { StatusBadge } from "@nyra/ui";

type ActionApprovalCardProps = {
  title: string;
  description: string;
  risk?: "low" | "medium" | "high";
  status?: string;
  expectedMutation?: string;
};

export function ActionApprovalCard({
  title,
  description,
  risk = "medium",
  status = "Pending",
  expectedMutation = "Service-owned mutation after broker approval",
}: ActionApprovalCardProps) {
  const Icon =
    risk === "high"
      ? AlertTriangle
      : risk === "low"
        ? CheckCircle2
        : ShieldCheck;
  const riskColor =
    risk === "high"
      ? "text-destructive bg-destructive/10 border-destructive/20"
      : risk === "low"
        ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
        : "text-primary bg-primary/10 border-primary/20";

  return (
    <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl overflow-hidden border-t-2 border-t-primary">
      <CardHeader className="gap-3 pb-3 border-b border-border/50 bg-background/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div
              className={`flex size-10 items-center justify-center rounded-lg border shadow-lg ${riskColor}`}
            >
              <Icon className="size-5" />
            </div>
            <CardTitle className="text-sm font-black text-foreground uppercase tracking-tight">
              {title}
            </CardTitle>
          </div>
          <StatusBadge
            status={status}
            className="bg-primary/10 text-primary border-primary/20"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="text-xs font-bold leading-5 text-muted-foreground uppercase tracking-tight">
          {description}
        </p>
        <div className="rounded-lg border border-border/30 bg-background/60 p-4 text-[10px] font-black font-mono text-primary shadow-inner flex items-center gap-3">
          <div className="size-1.5 rounded-full bg-primary" />
          {expectedMutation}
        </div>
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-lg h-10 shadow-lg shadow-emerald-500/20">
            APPROVE_ACTION
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive font-black uppercase tracking-widest text-[10px] rounded-lg h-10"
          >
            REJECT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
