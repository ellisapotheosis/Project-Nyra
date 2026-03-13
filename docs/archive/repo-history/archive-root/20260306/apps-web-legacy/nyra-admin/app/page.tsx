"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalLeads: 0,
    newLeadsToday: 0,
    conversionRate: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // In production, this would fetch from API
      // const data = await api.get<DashboardStats>("/api/dashboard/stats");

      // Mock data for development
      setStats({
        totalCampaigns: 8,
        activeCampaigns: 3,
        totalLeads: 342,
        newLeadsToday: 12,
        conversionRate: 18.4,
        totalRevenue: 1245000,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Campaigns",
      value: stats.totalCampaigns.toString(),
      subtext: `${stats.activeCampaigns} active`,
    },
    {
      label: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      subtext: `${stats.newLeadsToday} new today`,
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(1)}%`,
      subtext: "Last 30 days",
    },
    {
      label: "Total Revenue",
      value: `$${(stats.totalRevenue / 1000000).toFixed(2)}M`,
      subtext: "All-time",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-600">New lead: John Doe from Acme Corp</span>
                <span className="ml-auto text-gray-400">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">Campaign "Summer 2024" started</span>
                <span className="ml-auto text-gray-400">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-600">Lead converted: Jane Smith</span>
                <span className="ml-auto text-gray-400">3 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/campaigns"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Create New Campaign</p>
                <p className="text-sm text-gray-500">Set up a new marketing campaign</p>
              </a>
              <a
                href="/leads"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Add New Lead</p>
                <p className="text-sm text-gray-500">Manually add a lead to the system</p>
              </a>
              <a
                href="/chat"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Open Chat</p>
                <p className="text-sm text-gray-500">Chat with Dify AI assistant</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
