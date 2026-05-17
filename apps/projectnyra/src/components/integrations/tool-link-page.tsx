import { ExternalLink, ShieldCheck } from "lucide-react";

import { PageHeader } from "@nyra/ui";
import { ComplianceBadge } from "@nyra/ui";
import { buttonVariants } from "@nyra/ui";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";

export function ToolLinkPage({
  name,
  description,
  url,
  role,
}: {
  name: string;
  description: string;
  url?: string;
  role: string;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <PageHeader
        eyebrow="Tool Gateway"
        title={name}
        description={description}
        meta={
          <>
            <ComplianceBadge label="ACCESS_GATED" state="warning" />
            <ComplianceBadge label="NO_RAW_SECRET_DISPLAY" state="clear" />
          </>
        }
      />

      <Card className="border-border/50 bg-card/40 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-widest">
            {role}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border border-border/60 bg-background/45 p-5 text-sm leading-6 text-muted-foreground">
            This surface is intentionally a controlled gateway. Broker workflows
            should use Nyra-native CRM, campaign, quote, assistant, and
            compliance screens; raw tool UIs are for admin/debug use only.
          </div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants())}
            >
              <ExternalLink className="mr-2 size-4" />
              Open {name}
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/45 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Configure the matching `NEXT_PUBLIC_*` URL to enable this link.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
