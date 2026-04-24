"use client"

import { useEffect, useState } from "react"
import { BarChart3, Mail, Pause, Phone, Play, Plus, Settings2, Workflow } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Lead = {
  id: string
  firstName: string
  lastName: string
  campaignStatus: string
  campaignId?: string
  lastTouch?: string
  nextTouch?: string
}

type Campaign = {
  id: string
  name: string
  loanPurpose: string
  status: string
  steps: string[]
  activeLeads: number
  responseRate: string
}

export default function CampaignDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    async function loadData() {
      const [leadResponse, campaignResponse] = await Promise.all([fetch("/api/leads"), fetch("/api/campaigns")])
      const leadData = (await leadResponse.json()) as { leads?: Lead[] }
      const campaignData = (await campaignResponse.json()) as { campaigns?: Campaign[] }
      setLeads(leadData.leads ?? [])
      setCampaigns(campaignData.campaigns ?? [])
    }

    void loadData()
  }, [])

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Campaign Control</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Campaign Management</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            This page merges the original campaign dashboard into the new shared scaffold and uses local mock API
            routes so it renders as a complete experience inside the combined app.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings2 className="size-4" />
            Global Settings
          </Button>
          <Button>
            <Plus className="size-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leads" className="grid gap-6">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="leads">Active Leads</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Lead Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-4 py-3 font-medium">Lead</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Campaign</th>
                    <th className="px-4 py-3 font-medium">Last Touch</th>
                    <th className="px-4 py-3 font-medium">Next Touch</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50">
                      <td className="px-4 py-4 font-medium">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={lead.campaignStatus === "ACTIVE" ? "default" : "secondary"}>
                          {lead.campaignStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">{lead.campaignId ?? "-"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{lead.lastTouch ?? "-"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{lead.nextTouch ?? "-"}</td>
                      <td className="px-4 py-4">
                        <Button variant="ghost" size="icon-sm">
                          {lead.campaignStatus === "ACTIVE" ? <Pause className="size-4" /> : <Play className="size-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="border-border/70 bg-card/80 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3 text-xl">
                    {campaign.name}
                    <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>{campaign.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                  <p className="text-muted-foreground">{campaign.loanPurpose}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-muted-foreground">Steps</p>
                      <p className="font-semibold">{campaign.steps.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Leads</p>
                      <p className="font-semibold">{campaign.activeLeads}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response</p>
                      <p className="font-semibold">{campaign.responseRate}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Workflow className="size-4" />
                    Edit Sequence
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="size-4 text-primary" />
                  Total Outreach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">1,284</div>
                <p className="text-sm text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="size-4 text-primary" />
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">12.5%</div>
                <p className="text-sm text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="size-4 text-primary" />
                  TCPA Opt-Outs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">1.1%</div>
                <p className="text-sm text-muted-foreground">-0.2% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
