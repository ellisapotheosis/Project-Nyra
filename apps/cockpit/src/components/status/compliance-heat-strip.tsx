import { AlertTriangle, Clock3, FileCheck2, ShieldCheck } from "lucide-react";

import { Badge } from "@nyra/ui";
import { Card, CardContent } from "@nyra/ui";

type ComplianceHeatStripProps = {
  surface: "overview" | "assistant" | "leads" | "campaigns" | "quotes";
  className?: string;
};

const surfaceNotes = {
  overview: "Global command view. Mock/live state must stay labelled until service adapters are wired.",
  assistant: "Borrower-facing drafts require broker approval unless the campaign is already approved.",
  leads: "Consent, DNC, and source provenance must be visible before outreach actions.",
  campaigns: "STOP, unsubscribe, quiet hours, and reply-pauses gate every scheduled touch.",
  quotes: "Quote terms must come from the quote service and stay labelled by pricing source.",
};

const gates = [
  { label: "TCPA", state: "Consent checked", icon: ShieldCheck, tone: "text-turquoise-400 border-turquoise-500/20 bg-turquoise-500/10" },
  { label: "DNC", state: "Suppression visible", icon: FileCheck2, tone: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
  { label: "Quiet hours", state: "Dispatch guarded", icon: Clock3, tone: "text-amber-300 border-amber-500/20 bg-amber-500/10" },
  { label: "Audit", state: "External comms logged", icon: AlertTriangle, tone: "text-pink-300 border-pink-500/20 bg-pink-500/10" },
];

export function ComplianceHeatStrip({ surface, className }: ComplianceHeatStripProps) {
  return (
    <Card className={className ?? "border-border/50 bg-card/40 shadow-xl backdrop-blur-md"}>
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-turquoise-400">
            Compliance_Heat_Strip
          </p>
          <p className="mt-1 max-w-3xl text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground">
            {surfaceNotes[surface]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {gates.map(({ label, state, icon: Icon, tone }) => (
            <Badge key={label} variant="outline" className={`gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${tone}`}>
              <Icon className="size-3" />
              {label}: {state}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
