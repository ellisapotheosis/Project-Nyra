"use client";

import { Activity, Zap } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

interface WorkerCardProps {
  name: string;
  model: string;
  status: "online" | "offline" | "warning";
  memory: number;
  maxMemory: number;
  activeJobs: number;
  temperature?: number;
}

export function WorkerCard({
  name,
  model,
  status,
  memory,
  maxMemory,
  activeJobs,
  temperature,
}: WorkerCardProps) {
  const memoryPercent = (memory / maxMemory) * 100;

  return (
    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-xs text-purple-300/60">{model}</p>
        </div>
        <StatusIndicator status={status} label="" pulse={status === "online"} />
      </div>

      <div className="mt-4 space-y-3">
        {/* Memory Usage */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Memory</span>
            <span className="text-white font-medium">
              {memory.toFixed(1)}GB / {maxMemory}GB
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
            <div
              className={cn(
                "h-full transition-colors",
                memoryPercent > 80
                  ? "bg-red-500"
                  : memoryPercent > 60
                    ? "bg-yellow-500"
                    : "bg-green-500"
              )}
              style={{ width: `${memoryPercent}%` }}
            />
          </div>
        </div>

        {/* Active Jobs */}
        <div className="flex items-center gap-2 text-xs">
          <Activity size={14} className="text-purple-400" />
          <span className="text-gray-400">Active Jobs:</span>
          <span className="font-semibold text-white">{activeJobs}</span>
        </div>

        {/* Temperature */}
        {temperature !== undefined && (
          <div className="flex items-center gap-2 text-xs">
            <Zap size={14} className="text-purple-400" />
            <span className="text-gray-400">Temp:</span>
            <span className="font-semibold text-white">
              {temperature.toFixed(1)}°C
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
