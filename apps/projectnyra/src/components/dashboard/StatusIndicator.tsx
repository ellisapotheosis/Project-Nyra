"use client";

import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "offline" | "warning" | "error";
  label: string;
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  label,
  pulse = true,
}: StatusIndicatorProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            statusColors[status],
            pulse && "animate-pulse"
          )}
        />
        {pulse && (
          <div
            className={cn(
              "absolute inset-0 h-3 w-3 rounded-full animate-ping",
              statusColors[status]
            )}
          />
        )}
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
}
