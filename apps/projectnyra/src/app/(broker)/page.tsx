"use client";

import { useState, useEffect } from "react";
import { mockDashboardMetrics, mockLeads, mockWorkers } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(mockDashboardMetrics);
  const [recentLeads, setRecentLeads] = useState(mockLeads.slice(0, 3));

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        activeAgents: Math.floor(Math.random() * 12) + 8,
        pipelineValue: prev.pipelineValue + (Math.random() * 10000 - 5000),
        conversionRate: Math.random() * 0.15 + 0.35,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
          Neural Command Deck
        </h1>
        <p className="text-purple-300/60">
          Welcome back. Your mortgage operations hub is online.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Monthly Revenue */}
        <div className="rounded-lg border border-purple-500/20 bg-black/40 p-4 backdrop-blur">
          <p className="text-sm text-purple-300/60">Monthly Revenue</p>
          <p className="mt-2 text-2xl font-bold text-cyan-400">
            ${(metrics.monthlyRevenue / 1000000).toFixed(2)}M
          </p>
          <p className="mt-1 text-xs text-green-400">↑ 12.5% from last month</p>
        </div>

        {/* Pipeline Value */}
        <div className="rounded-lg border border-purple-500/20 bg-black/40 p-4 backdrop-blur">
          <p className="text-sm text-purple-300/60">Pipeline Value</p>
          <p className="mt-2 text-2xl font-bold text-purple-400">
            ${(metrics.pipelineValue / 1000000).toFixed(2)}M
          </p>
          <p className="mt-1 text-xs text-purple-400/60">
            {metrics.activeLeads} active leads
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-lg border border-purple-500/20 bg-black/40 p-4 backdrop-blur">
          <p className="text-sm text-purple-300/60">Conversion Rate</p>
          <p className="mt-2 text-2xl font-bold text-pink-400">
            {(metrics.conversionRate * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-pink-400/60">↑ 2.3% trend</p>
        </div>

        {/* Active Agents */}
        <div className="rounded-lg border border-purple-500/20 bg-black/40 p-4 backdrop-blur">
          <p className="text-sm text-purple-300/60">Active Agents</p>
          <p className="mt-2 text-2xl font-bold text-green-400">
            {metrics.activeAgents}
          </p>
          <p className="mt-1 text-xs text-green-400/60">
            of {mockWorkers.length} workers online
          </p>
        </div>
      </div>

      {/* Recent Activity & Lead Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-lg border border-purple-500/20 bg-black/40 p-6 backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-purple-300">
            Recent Leads
          </h2>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between rounded-lg border border-purple-500/10 bg-purple-950/10 p-3 transition hover:border-purple-500/30 hover:bg-purple-950/20"
              >
                <div>
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="text-xs text-purple-300/60">
                    {lead.loanPurpose} • ${lead.loanAmount.toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">
                  {lead.status}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/leads"
            className="mt-4 inline-block text-sm text-cyan-400 hover:underline"
          >
            View all leads →
          </Link>
        </div>

        {/* System Status */}
        <div className="rounded-lg border border-purple-500/20 bg-black/40 p-6 backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-purple-300">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-300">TwentyCRM</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                <span className="text-xs text-green-400">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-300">Activepieces</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                <span className="text-xs text-green-400">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-300">GPU Workers</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                <span className="text-xs text-green-400">
                  {mockWorkers.length} online
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-300">Memory System</p>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                <span className="text-xs text-green-400">Synced</span>
              </span>
            </div>
          </div>
          <Link
            href="/orchestrator"
            className="mt-4 inline-block text-sm text-cyan-400 hover:underline"
          >
            View orchestrator →
          </Link>
        </div>
      </div>

      {/* Worker Status */}
      <div className="rounded-lg border border-purple-500/20 bg-black/40 p-6 backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-purple-300">
          GPU Workers
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockWorkers.map((worker) => (
            <Link
              key={worker.id}
              href={`/workers/${worker.id}`}
              className="rounded-lg border border-purple-500/10 bg-purple-950/10 p-4 transition hover:border-purple-500/30 hover:bg-purple-950/20"
            >
              <p className="font-semibold text-white">{worker.name}</p>
              <p className="text-xs text-purple-300/60">{worker.gpu}</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300/60">Memory</span>
                  <span className="text-cyan-400">{worker.memoryUsage}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-purple-950">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{
                      width: `${worker.memoryUsage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-purple-500/20 bg-black/40 p-6 backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-purple-300">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link
            href="/leads"
            className="rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 text-center text-sm font-medium text-purple-300 transition hover:from-purple-600/40 hover:to-pink-600/40"
          >
            New Lead
          </Link>
          <Link
            href="/campaigns"
            className="rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 text-center text-sm font-medium text-purple-300 transition hover:from-purple-600/40 hover:to-pink-600/40"
          >
            New Campaign
          </Link>
          <Link
            href="/quotes"
            className="rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 text-center text-sm font-medium text-purple-300 transition hover:from-purple-600/40 hover:to-pink-600/40"
          >
            New Quote
          </Link>
          <Link
            href="/crm"
            className="rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-3 text-center text-sm font-medium text-purple-300 transition hover:from-purple-600/40 hover:to-pink-600/40"
          >
            Sync CRM
          </Link>
        </div>
      </div>
    </div>
  );
}
