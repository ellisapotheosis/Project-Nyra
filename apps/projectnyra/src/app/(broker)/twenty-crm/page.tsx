"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { PageHeader } from "@nyra/ui";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "synced" | "pending" | "error";
  lastSync: string;
  deals: number;
}

export default function TwentyCRMPage() {
  const [syncing, setSyncing] = useState(false);

  const stats = {
    totalContacts: 2847,
    activeDeals: 156,
    syncStatus: "synced" as const,
    lastSync: "2 hours ago",
  };

  const recentContacts: Contact[] = [
    {
      id: "1",
      name: "John Martinez",
      email: "john@acmecorp.com",
      phone: "+1-555-0101",
      company: "Acme Corp",
      status: "synced",
      lastSync: "1h ago",
      deals: 3,
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah@techventures.io",
      phone: "+1-555-0102",
      company: "Tech Ventures",
      status: "synced",
      lastSync: "2h ago",
      deals: 5,
    },
    {
      id: "3",
      name: "Michael Rodriguez",
      email: "michael@realtyplus.com",
      phone: "+1-555-0103",
      company: "Realty Plus",
      status: "pending",
      lastSync: "15m ago",
      deals: 2,
    },
  ];

  const objectMappings = [
    { crm: "Contact", local: "Lead", status: "synced", count: 2847 },
    { crm: "Deal", local: "Opportunity", status: "synced", count: 1203 },
    { crm: "Company", local: "Account", status: "synced", count: 412 },
    { crm: "Activity", local: "Event", status: "synced", count: 8934 },
  ];

  const syncHistory = [
    {
      id: "1",
      type: "Full Sync",
      status: "completed",
      timestamp: "Today 10:30 AM",
      records: 4562,
    },
    {
      id: "2",
      type: "Incremental",
      status: "completed",
      timestamp: "Today 08:00 AM",
      records: 234,
    },
    {
      id: "3",
      type: "Full Sync",
      status: "completed",
      timestamp: "Yesterday 11:00 PM",
      records: 4789,
    },
  ];

  const handleSync = async () => {
    setSyncing(true);
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncing(false);
  };

  const statusIcon = (status: Contact["status"]) => {
    switch (status) {
      case "synced":
        return <CheckCircle size={16} className="text-green-400" />;
      case "pending":
        return <Clock size={16} className="text-yellow-400" />;
      case "error":
        return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "completed":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <PageHeader
        title="TwentyCRM Integration"
        subtitle="Manage your CRM connection, data mapping, and synchronization"
      />

      {/* Connection Status */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Connection Status
              </h3>
              <p className="text-sm text-gray-400">
                TwentyCRM is actively syncing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-green-400">
                ● Connected
              </span>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="p-2 hover:bg-cyan-500/20 rounded border border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw
                  size={16}
                  className={`text-cyan-400 ${syncing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Contacts</p>
              <p className="text-2xl font-bold text-cyan-400">
                {stats.totalContacts.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Active Deals</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.activeDeals}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Sync</p>
              <p className="text-sm font-bold text-green-400">
                {stats.lastSync}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Sync Status</p>
              <p className="text-sm font-bold text-green-400">Healthy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Object Mappings */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Object Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {objectMappings.map((mapping) => (
              <div
                key={mapping.crm}
                className="flex items-center justify-between p-3 bg-black/40 rounded border border-border/30 hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {mapping.crm}
                  </p>
                  <p className="text-xs text-gray-500">
                    Maps to {mapping.local}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">
                    {mapping.count.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-semibold ${statusColor(mapping.status)}`}
                  >
                    {mapping.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Contacts */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Recent Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Deals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-border/30 hover:bg-black/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {contact.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{contact.email}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {contact.company}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-semibold">
                      {contact.deals}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {statusIcon(contact.status)}
                        <span
                          className={`text-xs font-semibold capitalize ${statusColor(contact.status)}`}
                        >
                          {contact.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Sync History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {syncHistory.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-black/40 rounded border border-border/30"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{log.type}</p>
                  <p className="text-xs text-gray-500">{log.timestamp}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">
                    {log.records} records
                  </p>
                  <span
                    className={`text-xs font-semibold ${statusColor(log.status)}`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
