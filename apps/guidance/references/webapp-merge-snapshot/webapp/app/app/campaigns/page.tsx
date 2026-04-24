'use client';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Plus, List, Settings, MessageSquare, Mail, Phone } from 'lucide-react';

// Mock data for initial scaffold
const mockLeads = [
  { id: '1', name: 'John Doe', status: 'ACTIVE', campaign: 'New Lead Nurture', lastTouch: '2026-04-20 10:00', nextTouch: '2026-04-21 10:00', channel: 'SMS' },
  { id: '2', name: 'Jane Smith', status: 'RESPONDED', campaign: 'Purchase Hot', lastTouch: '2026-04-19 14:30', nextTouch: '-', channel: 'Email' },
  { id: '3', name: 'Bob Wilson', status: 'PENDING', campaign: 'Refi Rate', lastTouch: '-', nextTouch: '2026-04-20 16:00', channel: 'Voice' },
];

const mockCampaigns = [
  { id: 'new_lead_nurture', name: 'New Lead Nurture', steps: 7, activeLeads: 12 },
  { id: 'purchase_hot', name: 'Purchase Hot', steps: 5, activeLeads: 8 },
  { id: 'refi_rate', name: 'Refi Rate', steps: 10, activeLeads: 5 },
];

export default function CampaignDashboard() {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, campaignsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/campaigns')
        ]);
        const leadsData = await leadsRes.json();
        const campaignsData = await campaignsRes.json();
        setLeads(leadsData.data || []);
        setCampaigns(campaignsData.campaigns || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center mt-20">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col space-y-6 p-8 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-muted-foreground">Monitor and orchestrate your mortgage lead drip campaigns.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Global Settings
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="leads">
            <List className="mr-2 h-4 w-4" />
            Active Leads
          </TabsTrigger>
          <TabsTrigger value="builder">
            <Settings className="mr-2 h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <MessageSquare className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Lead Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-3">Lead Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Campaign</th>
                      <th className="px-6 py-3">Last Touch</th>
                      <th className="px-6 py-3">Next Touch</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b">
                        <td className="px-6 py-4 font-medium">{lead.firstName} {lead.lastName}</td>
                        <td className="px-6 py-4">
                          <Badge variant={lead.campaignStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                            {lead.campaignStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{lead.campaignId || '-'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{lead.lastTouch || '-'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{lead.nextTouch || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {lead.campaignStatus === 'ACTIVE' ? (
                              <Button size="icon" variant="ghost" title="Pause Campaign">
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button size="icon" variant="ghost" title="Resume Campaign">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                          No active leads found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {campaign.name}
                    <Badge variant="outline">{JSON.parse(campaign.steps || '[]').length} Steps</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Loan Purpose: {campaign.loanPurpose}
                  </p>
                  <div className="flex space-x-2">
                    <Link href={`/app/campaigns/builder/${campaign.id}`} className="w-full">
                      <Button variant="secondary" className="w-full">Edit Sequence</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Link href="/app/campaigns/builder/new">
              <Card className="border-dashed h-full flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer min-h-[150px]">
                <div className="text-center">
                  <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 block text-sm font-medium">Create Template</span>
                </div>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outreach</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TCPA Opt-outs</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.1%</div>
                <p className="text-xs text-muted-foreground">-0.2% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
