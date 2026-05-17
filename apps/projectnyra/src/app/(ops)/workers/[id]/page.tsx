"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3,
  Clock,
  Gauge,
  Cpu,
  Network,
  ShieldCheck,
  History,
  ChevronRight,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nyra/ui";
import { PageHeader } from "@nyra/ui";
import { cn } from "@/lib/utils";

interface WorkerDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailProps) {
  const { id } = React.use(params);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("1h");

  // Historical telemetry data for charts
  const telemetryData = {
    "1h": [
      { time: "00:00", temp: 45, util: 20, power: 150, mem: 8 },
      { time: "10:00", temp: 52, util: 35, power: 220, mem: 15 },
      { time: "20:00", temp: 58, util: 55, power: 350, mem: 24 },
      { time: "30:00", temp: 64, util: 78, power: 480, mem: 34 },
      { time: "40:00", temp: 66, util: 85, power: 520, mem: 39 },
      { time: "50:00", temp: 68, util: 92, power: 575, mem: 42 },
    ],
    "6h": [
      { time: "00:00", temp: 42, util: 15, power: 120, mem: 5 },
      { time: "01:00", temp: 48, util: 30, power: 200, mem: 12 },
      { time: "02:00", temp: 55, util: 50, power: 330, mem: 22 },
      { time: "03:00", temp: 62, util: 75, power: 470, mem: 35 },
      { time: "04:00", temp: 65, util: 88, power: 540, mem: 40 },
      { time: "05:00", temp: 68, util: 92, power: 575, mem: 42 },
    ],
    "24h": [
      { time: "00:00", temp: 38, util: 5, power: 80, mem: 2 },
      { time: "04:00", temp: 45, util: 20, power: 150, mem: 8 },
      { time: "08:00", temp: 52, util: 40, power: 280, mem: 18 },
      { time: "12:00", temp: 62, util: 75, power: 470, mem: 35 },
      { time: "16:00", temp: 65, util: 82, power: 520, mem: 38 },
      { time: "20:00", temp: 68, util: 92, power: 575, mem: 42 },
    ],
  };

  const worker = {
    id,
    name: "RTX 5090",
    gpu: "NVIDIA RTX 5090",
    vram: 48,
    vramUsed: 42,
    status: "active" as const,
    utilization: 92,
    temperature: 68,
    powerDraw: 575,
    uptime: "23d 14h 32m",
    models: ["DeepSeek-R1 236B", "Qwen 2.5 72B"],
    recentJobs: [
      {
        id: "1",
        model: "DeepSeek-R1 236B",
        status: "running",
        progress: 65,
        duration: "2m 34s",
        tokensPerSec: 45.2,
        startTime: "14:32:15",
      },
      {
        id: "2",
        model: "Qwen 2.5 72B",
        status: "queued",
        progress: 0,
        duration: "—",
        tokensPerSec: 0,
        startTime: "14:45:00",
      },
      {
        id: "3",
        model: "DeepSeek-R1 236B",
        status: "completed",
        progress: 100,
        duration: "5m 12s",
        tokensPerSec: 47.8,
        startTime: "09:18:42",
      },
    ],
    metrics: {
      powerEfficiency: "78%",
      avgLatency: "245ms",
      errorRate: "0.02%",
      jobsCompleted: 1247,
      peakTemp: "72°C",
      peakPower: "650W",
      avgTemp: "62°C",
    },
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-turquoise-500 text-black shadow-lg";
      case "idle":
        return "bg-indigo-500 text-white shadow-lg";
      default:
        return "bg-pink-600 text-white shadow-lg";
    }
  };

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex items-center gap-6">
        <Link
          href="/fleet"
          className="p-3 rounded-full bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-600 hover:text-white transition-all shadow-inner group"
        >
          <ArrowLeft
            size={20}
            className="text-indigo-400 group-hover:text-white"
          />
        </Link>
        <div className="flex-1">
          <p className="text-turquoise-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
            Worker_Forensics
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-foreground leading-none">
            {worker.name}{" "}
            <span className="text-muted-foreground opacity-20 font-normal">
              /
            </span>{" "}
            <span className="text-indigo-400">{worker.gpu}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            className={cn(
              "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-none",
              statusColor(worker.status)
            )}
          >
            {worker.status}
          </Badge>
          <Button
            variant="outline"
            className="h-11 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] px-6 rounded-xl"
          >
            RE_CALIBRATE
          </Button>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <TelemetryTile
          label="GPU_UTILIZATION"
          value={`${worker.utilization}%`}
          icon={Activity}
          color="turquoise"
          progress={worker.utilization}
        />
        <TelemetryTile
          label="VRAM_LOAD"
          value={`${worker.vramUsed}GB / ${worker.vram}GB`}
          icon={BarChart3}
          color="indigo"
          progress={(worker.vramUsed / worker.vram) * 100}
        />
        <TelemetryTile
          label="THERMAL_INDEX"
          value={`${worker.temperature}°C`}
          icon={Gauge}
          color="pink"
          progress={worker.temperature}
          threshold={80}
        />
        <TelemetryTile
          label="POWER_DRAW"
          value={`${worker.powerDraw}W`}
          icon={Zap}
          color="indigo"
          progress={(worker.powerDraw / 700) * 100}
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Main Telemetry & Jobs */}
        <div className="space-y-12">
          <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]">
            <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                <Clock className="size-4" /> JOB_QUEUE_ORCHESTRATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {worker.recentJobs.map((job, idx) => (
                <div key={job.id} className="relative pl-10 pb-2 group/job">
                  {idx !== worker.recentJobs.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-border/40" />
                  )}
                  <div
                    className={cn(
                      "absolute left-0 top-1 size-4 rounded bg-background border flex items-center justify-center z-10 shadow-lg",
                      job.status === "running"
                        ? "text-turquoise-400 border-turquoise-500/30"
                        : "text-indigo-400 border-indigo-500/30"
                    )}
                  >
                    <div
                      className={cn(
                        "size-1.5 rounded-full bg-current",
                        job.status === "running" && "animate-pulse"
                      )}
                    />
                  </div>
                  <div className="rounded-2xl border border-border/30 bg-background/50 p-5 group-hover/job:bg-indigo-500/5 transition-all shadow-inner">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-foreground">
                          {job.model}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                          ID: {job.id.padStart(4, "0")} • START: {job.startTime}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0 border-none shadow-lg",
                          job.status === "running"
                            ? "bg-turquoise-500 text-black"
                            : "bg-indigo-600 text-white"
                        )}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    {job.status === "running" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-turquoise-400">
                          <span>THROUGHPUT: {job.tokensPerSec} T/S</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-border/30 shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-turquoise-400 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Ops */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border-b border-border/30 pb-3">
              PERFORMANCE_ANALYTICS
            </h3>
            <div className="space-y-4">
              <MetricMini
                label="Avg Latency"
                value={worker.metrics.avgLatency}
                color="turquoise"
              />
              <MetricMini
                label="Error Rate"
                value={worker.metrics.errorRate}
                color="pink"
              />
              <MetricMini
                label="Power Efficiency"
                value={worker.metrics.powerEfficiency}
                color="indigo"
              />
              <MetricMini
                label="Jobs Completed"
                value={worker.metrics.jobsCompleted}
                color="turquoise"
              />
            </div>
          </div>

          <Card className="bg-card/40 border-indigo-500/30 overflow-hidden shadow-2xl rounded-[32px] p-8 space-y-6 border-t-2 border-t-indigo-500">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/30">
                <History className="size-6 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter italic text-foreground">
                Node_Uptime
              </h3>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
              Stable execution protocol active for 23 days. No critical kernel
              panics detected.
            </p>
            <div className="pt-2">
              <p className="text-xl font-black text-turquoise-400 italic uppercase tracking-tighter">
                {worker.uptime}
              </p>
              <p className="text-[8px] font-black uppercase text-muted-foreground mt-1 tracking-widest">
                TOTAL_UPTIME_INDEX
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TelemetryTile({
  label,
  value,
  icon: Icon,
  color,
  progress,
  threshold,
}: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 border-t-indigo-500",
    turquoise: "text-turquoise-400 border-t-turquoise-500",
    pink: "text-pink-400 border-t-pink-500",
  };
  return (
    <Card
      className={cn(
        "bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden group hover:border-indigo-500/30 transition-all rounded-[24px]",
        colorMap[color]
      )}
    >
      <CardHeader className="p-5 pb-2 bg-background/20 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
          {label}
        </CardTitle>
        <Icon className="size-4" />
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <p className="text-3xl font-black text-foreground tracking-tighter italic group-hover:translate-x-1 transition-transform">
          {value}
        </p>
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-border/20 shadow-inner">
          <div
            className={cn(
              "h-full shadow-[0_0_8px]",
              color === "indigo"
                ? "bg-indigo-500 shadow-indigo-500/50"
                : color === "turquoise"
                  ? "bg-turquoise-500 shadow-turquoise-500/50"
                  : "bg-pink-500 shadow-pink-500/50"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricMini({ label, value, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400",
    turquoise: "text-turquoise-400",
    pink: "text-pink-400",
  };
  return (
    <div className="p-5 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between shadow-inner group hover:bg-indigo-500/10 transition-all">
      <div className="space-y-1">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 group-hover:text-indigo-400 transition-colors">
          {label}
        </p>
        <p
          className={cn(
            "text-xl font-black uppercase tracking-tight italic",
            colorMap[color]
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
