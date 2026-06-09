"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Cpu,
  Database,
  HardDrive,
  Network,
  Server,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend?: "up" | "down";
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative group p-5 rounded-2xl",
        "bg-card/50 backdrop-blur-sm border border-border/40",
        "hover:border-primary/40 hover:bg-card/70",
        "transition-all duration-500",
        "hover:shadow-[0_0_30px_oklch(0.5038_0.2937_285.3753_/_0.2)]"
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-green-400" : "text-red-400"
            )}
          >
            <ArrowUpRight
              className={cn("w-3 h-3", trend === "down" && "rotate-180")}
            />
            {change}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground tracking-wide uppercase">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SystemModule({
  name,
  status,
  load,
}: {
  name: string;
  status: "online" | "warning" | "offline";
  load: number;
}) {
  const statusColors = {
    online: "bg-green-500",
    warning: "bg-yellow-500",
    offline: "bg-red-500",
  };

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-muted/30 border border-border/30",
        "hover:border-primary/30 hover:bg-muted/50",
        "transition-all duration-300"
      )}
    >
      <div className={cn("w-2 h-2 rounded-full animate-pulse", statusColors[status])} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <div className="mt-2 h-1.5 bg-background/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${load}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{load}%</span>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          System Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor your integrations and system health in real-time.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Connections"
          value="2,847"
          change="+12.5%"
          icon={Network}
          trend="up"
        />
        <StatCard
          title="Data Processed"
          value="1.2 TB"
          change="+8.3%"
          icon={Database}
          trend="up"
        />
        <StatCard
          title="API Requests"
          value="847K"
          change="+23.1%"
          icon={Zap}
          trend="up"
        />
        <StatCard
          title="System Uptime"
          value="99.97%"
          change="-0.02%"
          icon={Activity}
          trend="down"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Modules */}
        <motion.div
          variants={itemVariants}
          className={cn(
            "lg:col-span-2 p-6 rounded-2xl",
            "bg-card/50 backdrop-blur-sm border border-border/40"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Boxes className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Integration Modules</h2>
                <p className="text-xs text-muted-foreground">Real-time system status</p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              All Systems Nominal
            </span>
          </div>
          <div className="space-y-3">
            <SystemModule name="n8n Workflow Engine" status="online" load={67} />
            <SystemModule name="Twenty CRM Connector" status="online" load={45} />
            <SystemModule name="Router Administration" status="online" load={23} />
            <SystemModule name="Database Sync Service" status="warning" load={89} />
            <SystemModule name="Authentication Gateway" status="online" load={34} />
          </div>
        </motion.div>

        {/* Server Metrics */}
        <motion.div
          variants={itemVariants}
          className={cn(
            "p-6 rounded-2xl",
            "bg-card/50 backdrop-blur-sm border border-border/40"
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Server Metrics</h2>
              <p className="text-xs text-muted-foreground">Primary cluster</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Cpu className="w-4 h-4" /> CPU Usage
                </span>
                <span className="font-medium text-foreground">42%</span>
              </div>
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="w-4 h-4" /> Memory
                </span>
                <span className="font-medium text-foreground">6.2 / 16 GB</span>
              </div>
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "38.75%" }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Database className="w-4 h-4" /> Storage
                </span>
                <span className="font-medium text-foreground">234 / 500 GB</span>
              </div>
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "46.8%" }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-gradient-to-r from-secondary to-secondary/60 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Network Activity Visualization */}
          <div className="mt-6 pt-6 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              Network Activity
            </p>
            <div className="flex items-end justify-between h-16 gap-1">
              {[40, 65, 45, 80, 55, 70, 35, 90, 60, 75, 50, 85].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 1 }}
                  className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-sm"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "p-6 rounded-2xl",
          "bg-card/50 backdrop-blur-sm border border-border/40"
        )}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { time: "2 min ago", event: "n8n workflow 'Data Sync' completed successfully", type: "success" },
            { time: "15 min ago", event: "New CRM contact imported from API", type: "info" },
            { time: "1 hour ago", event: "Database backup completed", type: "success" },
            { time: "2 hours ago", event: "High memory usage detected on worker-3", type: "warning" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className={cn(
                  "w-2 h-2 mt-2 rounded-full",
                  item.type === "success" && "bg-green-500",
                  item.type === "info" && "bg-blue-500",
                  item.type === "warning" && "bg-yellow-500"
                )}
              />
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.event}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
