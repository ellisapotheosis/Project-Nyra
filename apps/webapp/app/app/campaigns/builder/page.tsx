'use client';

import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { campaignApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';

export default function CampaignBuilderPage() {
  const campaignsApi = useApi(campaignApi.getCampaigns);

  useEffect(() => {
    campaignsApi.execute();
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Campaign Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your mortgage drip campaign sequences and touchpoints.
          </p>
        </div>
        <Link href="/campaigns/builder/new">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </button>
        </Link>
      </div>

      <StatusGate
        data={campaignsApi.data?.campaigns ?? null}
        error={campaignsApi.error}
        isLoading={campaignsApi.isLoading}
        onRetry={campaignsApi.execute}
        loadingMessage="Loading campaigns..."
        emptyMessage="No campaign templates found."
      >
        {(campaigns) => (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign: any) => (
              <Link key={campaign.id} href={`/campaigns/builder/${campaign.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {campaign.name}
                      <Badge variant="outline">{Array.isArray(campaign.steps) ? campaign.steps.length : 0} Steps</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Purpose: {campaign.loanPurpose || 'General'}
                    </p>
                    <p className="mt-4 text-xs text-primary font-medium">Click to edit sequence →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </StatusGate>
    </div>
  )
}
