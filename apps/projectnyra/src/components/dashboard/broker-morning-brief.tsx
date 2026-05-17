import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageSquareReply,
  RefreshCw,
} from "lucide-react";

import { Button } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";

const briefItems = [
  {
    label: "Hot replies",
    value: "7",
    detail: "Borrowers waiting under 15m",
    icon: MessageSquareReply,
    tone: "text-turquoise-400",
  },
  {
    label: "Quote locks",
    value: "3",
    detail: "Expiring within 7 days",
    icon: Clock3,
    tone: "text-amber-300",
  },
  {
    label: "Compliance blocks",
    value: "2",
    detail: "Consent or DNC review needed",
    icon: AlertTriangle,
    tone: "text-pink-300",
  },
  {
    label: "CRM sync",
    value: "99%",
    detail: "Twenty write health",
    icon: RefreshCw,
    tone: "text-indigo-400",
  },
];

export function BrokerMorningBrief() {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-turquoise-500/20 bg-card/40 shadow-2xl backdrop-blur-md">
      <CardHeader className="border-b border-border/50 bg-turquoise-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.24em] text-turquoise-400">
              Broker_Morning_Brief
            </CardTitle>
            <p className="mt-2 max-w-2xl text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground">
              Mock command card for today&apos;s urgency, quote locks, reply
              pressure, compliance blocks, and CRM sync health.
            </p>
          </div>
          <Link href="/assistant">
            <Button className="h-10 rounded-xl bg-turquoise-500 px-5 text-[9px] font-black uppercase tracking-widest text-black hover:bg-turquoise-400">
              Open Assistant <ArrowRight className="ml-2 size-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
        {briefItems.map(({ label, value, detail, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/40 bg-background/45 p-4 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <Icon className={`size-4 ${tone}`} />
            </div>
            <p className="mt-3 text-3xl font-black tracking-tighter text-foreground">
              {value}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              {detail}
            </p>
          </div>
        ))}
        <div className="rounded-2xl border border-turquoise-500/20 bg-turquoise-500/10 p-4 shadow-inner md:col-span-2 xl:col-span-4">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-turquoise-400">
            <CheckCircle2 className="size-4" />
            State label: operational mock until adapters promote each metric to
            live service data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
