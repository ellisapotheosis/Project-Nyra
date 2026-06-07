"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ComplianceMatrixProps {
  hasConsent?: boolean;
  onDncList?: boolean;
  quietHoursStatus: {
    inQuietHours: boolean;
    label: string;
  };
}

export function ComplianceMatrix({
  hasConsent,
  onDncList,
  quietHoursStatus,
}: ComplianceMatrixProps) {
  return (
    <div className="px-6 py-4 border-y border-border/40 bg-muted/20">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn(
            "h-6 border-none px-0 text-[10px] font-bold uppercase tracking-tight",
            hasConsent ? "text-turquoise-400" : "text-pink-400"
          )}
        >
          {hasConsent ? "● TCPA Consent" : "○ No Consent"}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "h-6 border-none px-0 text-[10px] font-bold uppercase tracking-tight",
            onDncList ? "text-pink-400" : "text-muted-foreground"
          )}
        >
          {onDncList ? "● DNC Active" : "○ Not DNC"}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "h-6 border-none px-0 text-[10px] font-bold uppercase tracking-tight",
            quietHoursStatus.inQuietHours ? "text-amber-400" : "text-indigo-400"
          )}
        >
          {quietHoursStatus.label}
        </Badge>
      </div>
    </div>
  );
}
