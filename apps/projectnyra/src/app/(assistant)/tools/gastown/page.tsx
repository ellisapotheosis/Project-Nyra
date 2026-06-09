import Link from "next/link";
import { ExternalLink, ServerCog, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const gastownUrl =
  process.env.NEXT_PUBLIC_GASTOWN_URL || "https://gastown.projectnyra.com";

export default function GastownToolsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase text-primary">
          Access-gated workspace
        </p>
        <h1 className="text-3xl font-bold tracking-tight">/tools/gastown</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gastown is the Oracle-hosted workspace manager for supervised operator
          coordination.
        </p>
      </div>

      <Card className="border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ServerCog className="size-5 text-primary" />
            Gastown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start gap-3 rounded-md border border-border/40 bg-background/50 p-4">
            <ShieldCheck className="mt-0.5 size-4 text-turquoise-400" />
            <p className="text-sm text-muted-foreground">
              Open only through Cloudflare Access or Tailscale-approved routes.
              Do not expose worker model, database, or raw MCP endpoints through
              this page.
            </p>
          </div>

          <Link href={gastownUrl} target="_blank" rel="noreferrer">
            <Button className="gap-2">
              Launch Gastown
              <ExternalLink className="size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
