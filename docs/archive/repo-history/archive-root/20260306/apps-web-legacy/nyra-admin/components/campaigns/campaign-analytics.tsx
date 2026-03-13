"use client";

import { CampaignAnalytics } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CampaignAnalyticsViewProps {
  analytics: CampaignAnalytics;
}

export function CampaignAnalyticsView({ analytics }: CampaignAnalyticsViewProps) {
  const metrics = [
    { label: "Total Leads", value: analytics.totalLeads, format: (v: number) => v.toString() },
    { label: "Qualified Leads", value: analytics.qualifiedLeads, format: (v: number) => v.toString() },
    { label: "Conversions", value: analytics.conversions, format: (v: number) => v.toString() },
    { label: "Conversion Rate", value: analytics.conversionRate, format: (v: number) => `${v.toFixed(1)}%` },
    { label: "Avg Lead Score", value: analytics.averageScore, format: (v: number) => v.toFixed(1) },
    { label: "Revenue Generated", value: analytics.revenueGenerated, format: (v: number) => `$${v.toLocaleString()}` },
    { label: "Cost Per Lead", value: analytics.costPerLead, format: (v: number) => `$${v.toFixed(2)}` },
    { label: "ROI", value: analytics.roi, format: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Campaign Analytics</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-semibold">{metric.format(metric.value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
