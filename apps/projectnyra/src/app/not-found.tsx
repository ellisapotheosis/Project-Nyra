import Link from "next/link";
import { ArrowLeft, RadioTower } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-xl space-y-6 rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3 text-turquoise-400">
          <span className="grid size-10 place-items-center rounded-xl border border-border/50 bg-background/70">
            <RadioTower className="size-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Route unavailable
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            This operator surface is not available.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The requested route is outside the current Project Nyra command
            surface or has not been wired to a broker-safe page yet.
          </p>
        </div>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="size-4" />
            Return to command deck
          </Button>
        </Link>
      </section>
    </main>
  );
}
