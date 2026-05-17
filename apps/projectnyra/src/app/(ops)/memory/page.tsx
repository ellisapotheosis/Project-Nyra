"use client";

import { useState } from "react";
import {
  Database,
  BarChart3,
  TrendingUp,
  Search,
  Trash2,
  Eye,
  Brain,
  Box,
  Network,
  Zap,
  Clock,
  History,
  FileText,
  ChevronRight,
  Sparkles,
  Filter,
  Download,
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

interface MemoryEntry {
  id: string;
  title: string;
  type: "fact" | "conversation" | "decision" | "pattern" | "metric";
  size: number;
  createdAt: string;
  accessedAt: string;
  category: string;
}

interface MemoryStats {
  system: "session" | "persistent" | "enterprise";
  name: string;
  entries: number;
  storage: string;
  ttl: string;
  status: "active" | "standby" | "archived";
}

const MEMORY_ENTRIES: MemoryEntry[] = [
  {
    id: "1",
    title: "Mortgage Pre-Qual Flow",
    type: "pattern",
    size: 4.2,
    createdAt: "2 days ago",
    accessedAt: "10m ago",
    category: "workflows",
  },
  {
    id: "2",
    title: "Compliance TRID Rules",
    type: "decision",
    size: 2.8,
    createdAt: "5 days ago",
    accessedAt: "2h ago",
    category: "compliance",
  },
  {
    id: "3",
    title: "Quote Engine Metrics",
    type: "metric",
    size: 1.5,
    createdAt: "1 day ago",
    accessedAt: "15m ago",
    category: "analytics",
  },
  {
    id: "4",
    title: "TwentyCRM Field Mappings",
    type: "fact",
    size: 0.8,
    createdAt: "3 days ago",
    accessedAt: "1h ago",
    category: "integrations",
  },
  {
    id: "5",
    title: "Lead Qualification Logic",
    type: "pattern",
    size: 3.2,
    createdAt: "4 days ago",
    accessedAt: "3h ago",
    category: "workflows",
  },
  {
    id: "6",
    title: "Broker Commission Rates",
    type: "fact",
    size: 0.5,
    createdAt: "1 week ago",
    accessedAt: "5h ago",
    category: "business-rules",
  },
];

const MEMORY_SYSTEMS: MemoryStats[] = [
  {
    system: "session",
    name: "Session_Buffer (Letta)",
    entries: 128,
    storage: "512 KB",
    ttl: "5 min",
    status: "active",
  },
  {
    system: "persistent",
    name: "Persistent_Archive (Mempalace)",
    entries: 1240,
    storage: "2.3 GB",
    ttl: "Indefinite",
    status: "active",
  },
  {
    system: "enterprise",
    name: "Knowledge_Base (Mem0)",
    entries: 18,
    storage: "8.7 GB",
    ttl: "Indefinite",
    status: "active",
  },
];

export default function MemoryPage() {
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"accessed" | "size" | "created">(
    "accessed"
  );

  const filteredEntries = MEMORY_ENTRIES.filter((entry) => {
    const searchMatch =
      searchQuery === "" ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = typeFilter === "all" || entry.type === typeFilter;
    return searchMatch && typeMatch;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case "size":
        return b.size - a.size;
      case "created":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "accessed":
      default:
        return (
          new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
        );
    }
  });

  const totalMemory = MEMORY_SYSTEMS.reduce((acc, sys) => {
    const size = sys.storage.includes("GB")
      ? parseFloat(sys.storage)
      : parseFloat(sys.storage) / 1024;
    return acc + size;
  }, 0);

  const typeBreakdown = {
    pattern: MEMORY_ENTRIES.filter((e) => e.type === "pattern").length,
    fact: MEMORY_ENTRIES.filter((e) => e.type === "fact").length,
    decision: MEMORY_ENTRIES.filter((e) => e.type === "decision").length,
    metric: MEMORY_ENTRIES.filter((e) => e.type === "metric").length,
    conversation: MEMORY_ENTRIES.filter((e) => e.type === "conversation")
      .length,
  };

  const getTypeColor = (type: MemoryEntry["type"]) => {
    switch (type) {
      case "pattern":
        return "bg-indigo-500/10 text-indigo-400";
      case "fact":
        return "bg-turquoise-500/10 text-turquoise-400";
      case "decision":
        return "bg-pink-500/10 text-pink-400";
      case "metric":
        return "bg-indigo-600/10 text-indigo-300";
      case "conversation":
        return "bg-turquoise-600/10 text-turquoise-300";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-turquoise-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
            Cognitive_Infrastructure
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Neural_Memory_Registry
          </h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase tracking-tight text-xs opacity-60">
            Multi-tier cognitive recall architecture across local and
            distributed shards.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="h-10 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] px-6 rounded-xl shadow-inner hover:bg-indigo-500/10"
          >
            <History className="mr-2 size-3.5" /> REWIND_SESSION
          </Button>
          <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] px-8 rounded-xl shadow-lg shadow-indigo-500/30">
            <Download className="mr-2 size-3.5" /> EXPORT_MEMORY_MAP
          </Button>
        </div>
      </header>

      {/* Memory Systems Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {MEMORY_SYSTEMS.map((system) => (
          <Card
            key={system.system}
            className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl transition-all hover:border-indigo-500/30 group border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]"
          >
            <CardHeader className="p-8 pb-3 bg-indigo-500/5 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors italic">
                  {system.name}
                </CardTitle>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                  PARTICLES: {system.entries.toLocaleString()}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-[8px] font-black uppercase tracking-widest px-2 py-0 shadow-lg border-none",
                  system.status === "active"
                    ? "bg-turquoise-500 text-black"
                    : "bg-indigo-500 text-white"
                )}
              >
                {system.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/30">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  STORAGE_LOAD
                </span>
                <span className="text-sm font-black text-turquoise-400 italic">
                  {system.storage}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  EXPIRATION_TTL
                </span>
                <span className="text-sm font-black text-indigo-400 italic">
                  {system.ttl}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution Index */}
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground italic flex items-center gap-3">
              <Brain className="size-5 text-indigo-400" />
              MEMORY_INSPECTOR_TRACE
            </h2>
            <div className="flex gap-4 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-400 outline-none focus:border-indigo-400"
              >
                <option value="accessed">LAST_ACCESSED</option>
                <option value="size">PARTICLE_SIZE</option>
                <option value="created">PROTOCOL_BIRTH</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
              <Input
                placeholder="SEARCH_COGNITIVE_RECORDS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 bg-card/40 border-border/50 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:border-indigo-400 shadow-xl"
              />
            </div>

            <div className="flex gap-2 flex-wrap pb-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-inner",
                  typeFilter === "all"
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-indigo-500/5 text-muted-foreground border-indigo-500/10 hover:border-indigo-500/30"
                )}
              >
                ALL_TYPES
              </button>
              {Object.keys(typeBreakdown).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-inner",
                    typeFilter === type
                      ? "bg-turquoise-500 text-black border-turquoise-400"
                      : "bg-indigo-500/5 text-muted-foreground border-indigo-500/10 hover:border-indigo-500/30"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {sortedEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full text-left bg-card/40 backdrop-blur-md border border-border/30 hover:border-indigo-500/30 p-5 rounded-[20px] transition-all group flex items-center justify-between shadow-xl border-l-4 border-l-indigo-500/20 hover:border-l-indigo-500"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl border shadow-inner group-hover:scale-110 transition-transform",
                        getTypeColor(entry.type)
                      )}
                    >
                      <Box className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-foreground group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm truncate">
                          {entry.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-black uppercase px-2 border-none",
                            getTypeColor(entry.type)
                          )}
                        >
                          {entry.type}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60 italic">
                        {entry.category} • {entry.size} KB_SYNC
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-foreground uppercase italic">
                        {entry.accessedAt}
                      </p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-30">
                        LAST_RECALL
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Statistics Sidebar */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border-b border-border/30 pb-3">
              COGNITIVE_PULSE
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <MiniStat
                label="Total Particles"
                value={MEMORY_ENTRIES.length}
                icon={Database}
                color="indigo"
              />
              <MiniStat
                label="Cache Hit Rate"
                value="98.3%"
                icon={TrendingUp}
                color="turquoise"
              />
              <MiniStat
                label="Access Frequency"
                value="1.2K/hr"
                icon={Zap}
                color="pink"
              />
            </div>
          </div>

          <Card className="bg-indigo-600 border border-indigo-400/30 overflow-hidden shadow-2xl rounded-[32px] p-8 text-white relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <Sparkles className="size-10 text-white mb-6 opacity-80 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black uppercase tracking-tighter italic">
              Sacred_Graph_Ready
            </h3>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-80">
              FalkorDB logic is primed for holographic visualization. Mapping
              15k+ context nodes.
            </p>
            <Button
              variant="outline"
              className="w-full mt-8 h-12 bg-white/10 border-white/20 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[9px] rounded-xl"
            >
              OPEN_HOLOGRAPHIC_SURFACE
            </Button>
          </Card>
        </div>
      </div>

      {/* Entry Inspector Overlay */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 lg:p-20">
            <Card className="bg-card border border-indigo-500/50 max-w-2xl w-full rounded-[48px] shadow-[0_0_100px_-20px_rgba(99,102,241,0.4)] overflow-hidden flex flex-col border-t-2 border-t-indigo-500 animate-in zoom-in-95 duration-500">
              <header className="p-8 border-b border-border/40 bg-indigo-500/5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl border border-indigo-400/30">
                    <Brain className="size-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">
                      Particle_Inspector
                    </h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-40">
                      Entry_ID: {selectedEntry.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="size-12 rounded-full border border-border/40 bg-background/60 flex items-center justify-center text-muted-foreground hover:text-indigo-400 transition-colors"
                >
                  <ChevronRight className="size-6" />
                </button>
              </header>

              <div className="p-10 space-y-10 overflow-y-auto">
                <div className="p-8 rounded-[32px] bg-background/50 border border-border/30 shadow-inner">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">
                    CONTENT_TITLE:
                  </p>
                  <p className="text-xl font-black text-foreground uppercase tracking-tight leading-relaxed italic">
                    {selectedEntry.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <DataPoint
                    label="Protocol_Type"
                    value={selectedEntry.type.toUpperCase()}
                    color="turquoise"
                  />
                  <DataPoint
                    label="Particle_Size"
                    value={`${selectedEntry.size}KB`}
                    color="indigo"
                  />
                  <DataPoint
                    label="Protocol_Birth"
                    value={selectedEntry.createdAt.toUpperCase()}
                    color="indigo"
                  />
                  <DataPoint
                    label="Last_Recall"
                    value={selectedEntry.accessedAt.toUpperCase()}
                    color="indigo"
                  />
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-2">
                    HIERARCHY_CONTEXT:
                  </p>
                  <div className="p-6 rounded-[24px] border border-border/40 bg-background/30 flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-turquoise-500/10 border border-turquoise-500/20 flex items-center justify-center text-turquoise-400">
                      <Filter className="size-5" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-foreground">
                      CATEGORY: {selectedEntry.category}
                    </p>
                  </div>
                </div>
              </div>

              <footer className="p-8 bg-background/40 border-t border-border/40 flex gap-5">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntry(null)}
                  className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[9px] border-border/60"
                >
                  DISMISS_TRACE
                </Button>
                <Button className="flex-1 h-12 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-pink-500/30">
                  PURGE_PARTICLE <Trash2 className="ml-2 size-3.5" />
                </Button>
              </footer>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }: any) {
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
      <Icon
        className={cn(
          "size-5 opacity-20 group-hover:opacity-100 transition-opacity",
          colorMap[color]
        )}
      />
    </div>
  );
}

function DataPoint({ label, value, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400",
    turquoise: "text-turquoise-400",
  };
  return (
    <div className="space-y-1.5">
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
        {label}
      </p>
      <p
        className={cn(
          "text-xs font-black uppercase tracking-tight",
          colorMap[color]
        )}
      >
        {value}
      </p>
    </div>
  );
}
