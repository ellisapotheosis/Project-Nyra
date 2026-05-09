'use client';

import React, { use, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Mail, Phone, MapPin, Star, 
  Briefcase, DollarSign, Calendar, Clock,
  Tag, Globe, Share2
} from 'lucide-react';
import Link from 'next/link';

import { crmApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function LeadCockpitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const leadsApi = useApi(crmApi.getLeads);

  useEffect(() => {
    leadsApi.execute();
  }, []);

  const lead = leadsApi.data?.leads.find((l: any) => l.id === id);

  return (
    <div className="flex flex-col space-y-6 p-8 bg-background min-h-screen">
      <div className="flex items-center space-x-4">
        <Link href="/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Cockpit</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            {lead ? `${lead.firstName} ${lead.lastName}` : `Lead ID: ${id}`}
          </p>
        </div>
      </div>

      <StatusGate
        data={lead ?? null}
        error={leadsApi.error}
        isLoading={leadsApi.isLoading}
        onRetry={leadsApi.execute}
        loadingMessage="Fetching lead details..."
        emptyMessage="Lead not found."
      >
        {(currentLead: any) => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile & Stats */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-l-4 border-l-primary shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <Badge variant={currentLead.campaignStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                      {currentLead.campaignStatus || 'NEW'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{currentLead.firstName} {currentLead.lastName}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3 w-3 mr-1 text-primary" />
                      {currentLead.creditBand || 'Unknown'} Credit Band
                    </div>
                  </div>

                  <div className="grid gap-3 pt-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                      {currentLead.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                      {currentLead.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                      {currentLead.location || 'Location unknown'}
                    </div>
                  </div>

                  <div className="border-t pt-4 grid gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" /> Loan Purpose
                      </label>
                      <p className="text-sm font-medium">{currentLead.loanPurpose}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" /> Loan Amount
                      </label>
                      <p className="text-sm font-medium">{currency((currentLead.loanAmount || 0) / 10000)}</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> Created
                        </label>
                        <p className="text-xs">{currentLead.createdAt ? new Date(currentLead.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-end">
                          <Clock className="h-3 w-3 mr-1" /> Next Touch
                        </label>
                        <p className="text-xs text-primary font-medium">{currentLead.nextTouch || 'Not scheduled'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                    <Share2 className="mr-2 h-4 w-4" /> Source & Attribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lead Source</span>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      <Globe className="mr-1 h-3 w-3" /> {currentLead.source || 'Direct Entry'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attribution Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {currentLead.utm_source && <Badge variant="secondary" className="text-[10px]">src:{currentLead.utm_source}</Badge>}
                      {currentLead.utm_medium && <Badge variant="secondary" className="text-[10px]">med:{currentLead.utm_medium}</Badge>}
                      {currentLead.utm_campaign && <Badge variant="secondary" className="text-[10px]">cmp:{currentLead.utm_campaign}</Badge>}
                      {!currentLead.utm_source && !currentLead.utm_medium && !currentLead.utm_campaign && (
                        <p className="text-xs text-muted-foreground italic">No UTM tags available</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>IP: {currentLead.ip_address || 'hidden'}</span>
                    <span>Browser: {currentLead.browser || 'unknown'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Timeline & Assistant */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="min-h-[500px] flex flex-col">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" /> Unified Communication Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center italic text-muted-foreground">
                  Timeline implementation coming in Phase 2...
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </StatusGate>
    </div>
  );
}
