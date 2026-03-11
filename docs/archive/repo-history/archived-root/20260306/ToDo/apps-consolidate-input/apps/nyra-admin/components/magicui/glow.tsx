import * as React from "react";
import { cn } from "@/lib/utils";

/** Minimal “magicUI-ish” glow wrapper, safe defaults. */
export function Glow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-[1px] bg-gradient-to-br from-black/10 via-black/0 to-black/10",
        className
      )}
      {...props}
    />
  );
}
