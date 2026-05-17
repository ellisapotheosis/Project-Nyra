import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function NyraGlowSurface({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("nyra-glow-surface", className)} {...props}>
      {children}
    </div>
  );
}
