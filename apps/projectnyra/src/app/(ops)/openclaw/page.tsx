"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  Activity,
  BarChart3,
  Lock,
  Clock,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { PageHeader } from "@nyra/ui";

interface Task {
  id: string;
  type:
    | "lead_intake"
    | "compliance_check"
    | "quote_generation"
    | "document_review";
  status: "running" | "completed" | "failed";
  description: string;
  progress: number;
  startTime: string;
  duration: string;
  complianceChecks: number;
}

interface ComplianceEvent {
  id: string;
  timestamp: string;
  type: "pass" | "warning" | "block";
  rule: string;
  details: string;
}

export default function OpenClawPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks: Task[] = [
    {
      id: "1",
      type: "lead_intake",
      status: "running",
      description: "Process Lead #15847: Sarah Johnson",
      progress: 72,
      startTime: "2026-01-16 10:32 AM",
      duration: "3m 15s",
      complianceChecks: 5,
    },
    {
      id: "2",
      type: "compliance_check",
      status: "completed",
      description: "TILA/RESPA Validation: Loan #48392",
      progress: 100,
      startTime: "2026-01-16 10:15 AM",
      duration: "1m 8s",
      complianceChecks: 8,
    },
    {
      id: "3",
      type: "quote_generation",
      status: "completed",
      description: "Generate Quote: $350,000 @ 6.5%",
      progress: 100,
      startTime: "2026-01-16 10:08 AM",
      duration: "2m 3s",
      complianceChecks: 3,
    },
    {
      id: "4",
      type: "document_review",
      status: "failed",
      description: "Review W2 Document: Incomplete",
      progress: 45,
      startTime: "2026-01-16 09:58 AM",
      duration: "1m 42s",
      complianceChecks: 2,
    },
  ];

  const complianceLog: ComplianceEvent[] = [
    {
      id: "1",
      timestamp: "2026-01-16 10:45:22",
      type: "pass",
      rule: "TILA Disclosure Timing",
      details: "Disclosure sent within 3-day requirement window",
    },
    {
      id: "2",
      timestamp: "2026-01-16 10:42:15",
      type: "pass",
      rule: "RESPA APR Accuracy",
      details: "APR calculation verified against federal standards",
    },
    {
      id: "3",
      timestamp: "2026-01-16 10:38:48",
      type: "warning",
      rule: "TRID Interest Rate Lock",
      details: "Rate lock expires in 28 days - approaching renewal window",
    },
    {
      id: "4",
      timestamp: "2026-01-16 10:35:10",
      type: "pass",
      rule: "Data Privacy Check",
      details: "PII encryption verified, SSN masked in logs",
    },
    {
      id: "5",
      timestamp: "2026-01-16 10:32:05",
      type: "block",
      rule: "State-Specific Regulations",
      details: "CA: APR exceeds state max by 0.5% - requires rate adjustment",
    },
  ];

  const safetyGuards = [
    {
      name: "TILA/RESPA Check",
      enabled: true,
      violations: 0,
      lastCheck: "10:45 AM",
    },
    {
      name: "Data Privacy Guard",
      enabled: true,
      violations: 0,
      lastCheck: "10:44 AM",
    },
    {
      name: "Rate Lock Validation",
      enabled: true,
      violations: 1,
      lastCheck: "10:43 AM",
    },
    {
      name: "State Regulation Compliance",
      enabled: true,
      violations: 1,
      lastCheck: "10:42 AM",
    },
    {
      name: "TRID Accuracy Check",
      enabled: true,
      violations: 0,
      lastCheck: "10:41 AM",
    },
  ];

  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "lead_intake":
        return <Zap size={16} className="text-cyan-400" />;
      case "compliance_check":
        return <Lock size={16} className="text-green-400" />;
      case "quote_generation":
        return <BarChart3 size={16} className="text-purple-400" />;
      case "document_review":
        return <FileText size={16} className="text-pink-400" />;
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "running":
        return <Activity size={16} className="text-blue-400 animate-pulse" />;
      case "completed":
        return <CheckCircle2 size={16} className="text-green-400" />;
      case "failed":
        return <AlertTriangle size={16} className="text-red-400" />;
    }
  };

  const getComplianceIcon = (type: ComplianceEvent["type"]) => {
    switch (type) {
      case "pass":
        return <CheckCircle2 size={14} className="text-green-400" />;
      case "warning":
        return <AlertCircle size={14} className="text-yellow-400" />;
      case "block":
        return <AlertTriangle size={14} className="text-red-400" />;
    }
  };

  const getComplianceColor = (type: ComplianceEvent["type"]) => {
    switch (type) {
      case "pass":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "block":
        return "bg-red-500/10 text-red-400 border-red-500/30";
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const failedTasks = tasks.filter((t) => t.status === "failed").length;
  const runningTasks = tasks.filter((t) => t.status === "running").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="OpenClaw Agent"
        subtitle="Autonomous Agent for Mortgage Operations - Task Execution & Compliance Audit"
      />

      {/* Agent Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Activity size={14} /> Status
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <p className="text-lg font-bold text-green-400">Active</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">Processing leads</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Zap size={14} /> Tasks Today
            </p>
            <p className="text-2xl font-bold text-cyan-400">{tasks.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">
              {Math.round(
                (completedTasks / (completedTasks + failedTasks)) * 100
              )}
              %
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {failedTasks} failed this session
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Lock size={14} /> Compliance Mode
            </p>
            <p className="text-lg font-bold text-green-400">Enabled</p>
            <p className="text-xs text-slate-400 mt-2">All guards active</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Task Execution Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="w-full text-left p-4 rounded border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getTaskIcon(task.type)}
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-400">
                        {task.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Started {task.startTime} • {task.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(task.status)}
                    <span className="text-xs font-medium capitalize text-slate-400">
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-cyan-400 font-semibold">
                      {task.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span>Compliance checks: {task.complianceChecks}</span>
                    <span>
                      {task.status === "running"
                        ? "In Progress"
                        : task.status === "completed"
                          ? "Passed"
                          : "Failed"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Guards Status */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock size={18} /> Safety Guards & Compliance Validators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {safetyGuards.map((guard) => (
              <div
                key={guard.name}
                className="flex items-center justify-between p-3 rounded border border-slate-800 hover:border-slate-700"
              >
                <div className="flex items-center gap-3 flex-1">
                  {guard.enabled ? (
                    <CheckCircle2
                      size={16}
                      className="text-green-400 flex-shrink-0"
                    />
                  ) : (
                    <AlertCircle
                      size={16}
                      className="text-yellow-400 flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {guard.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Last checked: {guard.lastCheck}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {guard.violations > 0 ? (
                    <p className="text-xs font-bold text-yellow-400">
                      {guard.violations} violation
                      {guard.violations > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-green-400">OK</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Audit Trail */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={18} /> Compliance Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {complianceLog.map((event) => (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 rounded border ${getComplianceColor(event.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getComplianceIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {event.rule}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-black border border-cyan-400/30 max-w-2xl w-full max-h-96 overflow-y-auto">
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTaskIcon(selectedTask.type)}
                  <CardTitle className="text-white">
                    {selectedTask.description}
                  </CardTitle>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTask.status)}
                    <span className="text-sm font-semibold text-white capitalize">
                      {selectedTask.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Progress</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {selectedTask.progress}%
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${selectedTask.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-500/20">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Started</p>
                  <p className="text-sm text-white">{selectedTask.startTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="text-sm text-white">{selectedTask.duration}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-gray-500 mb-2">
                  Compliance Checks Performed
                </p>
                <p className="text-lg font-bold text-green-400">
                  {selectedTask.complianceChecks} checks passed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
