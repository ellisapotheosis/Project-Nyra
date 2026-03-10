"use client";

import { useState, useEffect } from "react";
import { Campaign, CampaignAnalytics } from "@/types";
import { campaignService } from "@/lib/api/campaigns";
import { CampaignList } from "@/components/campaigns/campaign-list";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { CampaignAnalyticsView } from "@/components/campaigns/campaign-analytics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [selectedAnalytics, setSelectedAnalytics] = useState<CampaignAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState("campaigns");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.list();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
      // Use mock data for development
      setCampaigns([
        {
          id: "1",
          name: "Summer 2024 Campaign",
          description: "Targeting small businesses",
          status: "active",
          startDate: "2024-06-01",
          endDate: "2024-08-31",
          targetAudience: "Small businesses",
          budget: 50000,
          leads: 125,
          conversions: 23,
          createdAt: "2024-05-15T10:00:00Z",
          updatedAt: "2024-06-01T10:00:00Z",
        },
        {
          id: "2",
          name: "Q4 Enterprise Push",
          description: "Focus on enterprise accounts",
          status: "active",
          startDate: "2024-10-01",
          leads: 45,
          conversions: 12,
          createdAt: "2024-09-20T10:00:00Z",
          updatedAt: "2024-10-01T10:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Campaign>) => {
    try {
      if (editingCampaign) {
        await campaignService.update(editingCampaign.id, data);
      } else {
        await campaignService.create(data);
      }
      loadCampaigns();
      setShowForm(false);
      setEditingCampaign(undefined);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      alert("Failed to save campaign. Using mock mode.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await campaignService.delete(id);
      loadCampaigns();
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      alert("Failed to delete campaign. Using mock mode.");
    }
  };

  const handleViewAnalytics = async (id: string) => {
    try {
      const analytics = await campaignService.analytics(id);
      setSelectedAnalytics(analytics);
      setActiveTab("analytics");
    } catch (err) {
      console.error("Failed to load analytics:", err);
      // Mock analytics data
      setSelectedAnalytics({
        campaignId: id,
        totalLeads: 125,
        qualifiedLeads: 78,
        conversions: 23,
        conversionRate: 18.4,
        averageScore: 72.5,
        revenueGenerated: 450000,
        costPerLead: 400,
        roi: 800,
      });
      setActiveTab("analytics");
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingCampaign(undefined);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <Button onClick={handleCreate} className="bg-blue-600 text-white hover:bg-blue-700">
          Create Campaign
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-medium">API Connection Error</p>
          <p>Using mock data for development. Error: {error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <CampaignList
            campaigns={campaigns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewAnalytics={handleViewAnalytics}
          />
        </TabsContent>

        <TabsContent value="analytics">
          {selectedAnalytics ? (
            <CampaignAnalyticsView analytics={selectedAnalytics} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a campaign to view analytics
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CampaignForm
        campaign={editingCampaign}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCampaign(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
