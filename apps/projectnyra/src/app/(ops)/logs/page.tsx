"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  Activity,
  ShieldCheck,
  Search,
  Filter,
  Database,
  Clock,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@nyra/ui";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  service: string;
  message: string;
  details?: {
    stackTrace?: string;
    affectedRecords?: number;
    duration?: string;
    retryCount?: number;
  };
  riskLevel?: "low" | "medium" | "high";
  compliance?: "TILA" | "RESPA" | "TRID" | null;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: "1",
    timestamp: "2026-05-12 10:45:32",
    level: "info",
    service: "TwentyCRM",
    message:
      "PROTOCOL_SYNC_COMPLETE: 2,847 records synchronized to Oracle-VPS.",
    riskLevel: "low",
    compliance: "TILA",
    details: { duration: "2.3s", affectedRecords: 2847 },
  },
  {
    id: "2",
    timestamp: "2026-05-12 10:42:18",
    level: "warn",
    service: "Quote API",
    message: "LATENCY_THRESHOLD_EXCEEDED: 5090 worker response time at 3.1s.",
    riskLevel: "medium",
    compliance: "TRID",
    details: { duration: "3.1s", retryCount: 1 },
  },
  {
    id: "3",
    timestamp: "2026-05-12 10:38:05",
    level: "error",
    service: "Activepieces",
    message: "INGRESS_ERROR: Handshake failed for webhook_relay_01.",
    riskLevel: "high",
    compliance: "RESPA",
    details: {
      stackTrace: "Error: Connection refused at machine:oracle-vps:3300",
      retryCount: 3,
    },
  },
  {
    id: "4",
    timestamp: "2026-05-12 10:35:12",
    level: "info",
    service: "Memory",
    message: "COGNITIVE_RECALL_SYNC: 1,542 particles archived to FalkorDB.",
    riskLevel: "low",
    compliance: null,
    details: { duration: "1.2s", affectedRecords: 1542 },
  },
  {
    id: "5",
    timestamp: "2026-05-12 10:32:45",
    level: "warn",
    service: "Nexus Router",
    message:
      "MODEL_ROUTE_FALLBACK: DeepSeek-R1 busy, falling back to Llama-3-70B.",
    riskLevel: "medium",
    compliance: null,
    details: { duration: "5.0s" },
  },
  {
    id: "6",
    timestamp: "2026-05-12 10:28:19",
    level: "error",
    service: "Compliance",
    message: "TCPA_GATING_VIOLATION: Automated outbound blocked for DNC_MATCH.",
    riskLevel: "high",
    compliance: "TILA",
    details: {
      stackTrace: "ComplianceError: Recipient phone in global DNC registry.",
      retryCount: 0,
    },
  },
];

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<Set<string>>(
    new Set(["info", "warn", "error"])
  );
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const services = [
    "TwentyCRM",
    "Quote API",
    "Activepieces",
    "Memory",
    "Nexus Router",
    "Compliance",
  ];

  const filteredLogs = logs.filter((log) => {
    const serviceMatch =
      serviceFilter === "all" || log.service === serviceFilter;
    const levelMatch = levelFilter.has(log.level);
    const searchMatch =
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return serviceMatch && levelMatch && searchMatch;
  });

  const toggleLevelFilter = (level: string) => {
    const newFilter = new Set(levelFilter);
    if (newFilter.has(level)) {
      newFilter.delete(level);
    } else {
      newFilter.add(level);
    }
    setLevelFilter(newFilter);
  };

  const levelStyles = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "bg-indigo-500/10 text-indigo-400 border-l-indigo-500";
      case "warn":
        return "bg-turquoise-500/10 text-turquoise-400 border-l-turquoise-500";
      case "error":
        return "bg-pink-500/10 text-pink-400 border-l-pink-500";
      default:
        return "bg-slate-500/10 text-slate-400 border-l-slate-500";
    }
  };

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-turquoise-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
            System_Forensics
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Operational_Audit_Trail
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase tracking-tight text-xs opacity-60">
            High-fidelity log buffer for cluster orchestration and compliance
            gating.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] px-6 shadow-inner"
          >
            <Clock className="mr-2 size-3.5" /> REWIND_HISTORY
          </Button>
          <Button className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] px-6 shadow-lg shadow-indigo-500/30">
            DOWNLOAD_TRACE_LOG
          </Button>
        </div>
      </header>

      {/* Filter Surface */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl rounded-[32px] overflow-hidden">
        <CardContent className="p-8 grid gap-8 md:grid-cols-4 items-center">
          <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
            <Input
              placeholder="SEARCH_PROTOCOL_TRACE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-background/40 border-border/50 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:border-indigo-400 shadow-inner"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              SEVERITY_INDEX:
            </p>
            <div className="flex gap-1.5">
              {["info", "warn", "error"].map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevelFilter(level)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                    levelFilter.has(level)
                      ? level === "info"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : level === "warn"
                          ? "bg-turquoise-500 text-black border-turquoise-400"
                          : "bg-pink-600 text-white border-pink-500"
                      : "bg-indigo-500/5 text-muted-foreground border-indigo-500/10 hover:border-indigo-500/30"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              NODE_FILTER:
            </p>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-10 px-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 outline-none focus:border-indigo-400"
            >
              <option value="all">ALL_NODES</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Feed */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-border/40 rounded-[48px] opacity-20">
            <Database className="size-16 mx-auto mb-6" />
            <p className="font-black uppercase tracking-[0.5em] text-lg text-foreground">
              NO_TRACE_MATCH
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <button
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className={cn(
                "w-full text-left border-l-4 p-6 rounded-[24px] transition-all hover:scale-[1.01] bg-card/40 border border-border/30 shadow-xl group flex flex-col md:flex-row md:items-center justify-between gap-6",
                levelStyles(log.level)
              )}
            >
              <div className="flex-1 min-w-0 flex items-start gap-6">
                <div className="p-3.5 rounded-2xl bg-background/50 border border-border/40 shadow-inner group-hover:scale-110 transition-transform">
                  {log.level === "error" ? (
                    <AlertTriangle className="size-5" />
                  ) : log.level === "warn" ? (
                    <AlertCircle className="size-5" />
                  ) : (
                    <Activity className="size-5" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                      {log.service}
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground opacity-20">
                      |
                    </span>
                    {log.compliance && (
                      <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[8px] font-black px-2">
                        {log.compliance}_ENFORCED
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground leading-snug uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                    {log.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0 text-right">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    {log.timestamp.split(" ")[0]}
                  </p>
                  <p className="text-[11px] font-black text-foreground uppercase tracking-tight italic">
                    {log.timestamp.split(" ")[1]}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Log Inspector Overlay */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 lg:p-20">
            <div className="w-full max-w-4xl bg-card border border-border/50 rounded-[48px] shadow-[0_0_100px_-20px_rgba(99,102,241,0.4)] overflow-hidden flex flex-col border-t-2 border-t-indigo-500 animate-in zoom-in-95 duration-500">
              <header className="p-8 border-b border-border/40 bg-indigo-500/5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl border border-indigo-400/30">
                    <Database className="size-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">
                      Log_Inspector
                    </h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-40">
                      Entry_ID: {selectedLog.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="size-12 rounded-full border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground hover:text-pink-400 transition-colors"
                >
                  <X className="size-6" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <DetailBlock
                    label="Cluster_Node"
                    value={selectedLog.service}
                    color="indigo"
                  />
                  <DetailBlock
                    label="Audit_Level"
                    value={selectedLog.level.toUpperCase()}
                    color={selectedLog.level === "error" ? "pink" : "turquoise"}
                  />
                  <DetailBlock
                    label="Compliance_Meta"
                    value={selectedLog.compliance || "N/A"}
                    color="indigo"
                  />
                </div>

                <div className="p-8 rounded-[32px] bg-background/50 border border-border/30 shadow-inner space-y-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                    PRIMARY_EVENT_MESSAGE:
                  </p>
                  <p className="text-lg font-black text-foreground uppercase tracking-tight leading-relaxed italic">
                    {selectedLog.message}
                  </p>
                </div>

                {selectedLog.details && (
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-turquoise-400 uppercase tracking-[0.3em] ml-2">
                      EXTENDED_TELEMETRY:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedLog.details.duration && (
                        <MetricMini
                          label="Lat_Time"
                          value={selectedLog.details.duration}
                        />
                      )}
                      {selectedLog.details.affectedRecords && (
                        <MetricMini
                          label="Rec_Count"
                          value={selectedLog.details.affectedRecords}
                        />
                      )}
                      {selectedLog.details.retryCount !== undefined && (
                        <MetricMini
                          label="Retry_Seq"
                          value={selectedLog.details.retryCount}
                        />
                      )}
                    </div>
                    {selectedLog.details.stackTrace && (
                      <div className="mt-8 space-y-4">
                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <Zap className="size-3" /> STACK_DUMP:
                        </p>
                        <pre className="p-8 bg-black border border-pink-500/20 rounded-[24px] text-pink-400 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-2xl shadow-pink-500/5">
                          {selectedLog.details.stackTrace}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <footer className="p-8 border-t border-border/40 bg-background/40 flex justify-end gap-5">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border/60"
                >
                  DISMISS_VIEWER
                </Button>
                <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/30">
                  ESCALATE_TO_ADMIN
                </Button>
              </footer>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBlock({ label, value, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400",
    turquoise: "text-turquoise-400",
    pink: "text-pink-400",
  };
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-black uppercase tracking-tight",
          colorMap[color]
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MetricMini({ label, value }: any) {
  return (
    <div className="p-5 rounded-2xl bg-background border border-border/40 shadow-sm text-center space-y-1">
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
        {label}
      </p>
      <p className="text-sm font-black text-foreground">{value}</p>
    </div>
  );
}
