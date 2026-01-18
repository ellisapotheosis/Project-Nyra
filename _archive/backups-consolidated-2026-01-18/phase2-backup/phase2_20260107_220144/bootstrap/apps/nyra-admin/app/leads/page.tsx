"use client";

import { useState, useEffect } from "react";
import { Lead } from "@/types";
import { leadService } from "@/lib/api/leads";
import { campaignService } from "@/lib/api/campaigns";
import { LeadList } from "@/components/leads/lead-list";
import { LeadDetails } from "@/components/leads/lead-details";
import { LeadFilters } from "@/components/leads/lead-filters";
import { CampaignAssignment } from "@/components/leads/campaign-assignment";
import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    campaignId?: string;
    search?: string;
  }>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, campaignsData] = await Promise.all([
        leadService.list(),
        campaignService.list(),
      ]);
      setLeads(leadsData);
      setCampaigns(campaignsData.map((c) => ({ id: c.id, name: c.name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      // Use mock data for development
      setLeads([
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1-555-0100",
          company: "Acme Corp",
          status: "qualified",
          source: "Website",
          campaignId: "1",
          campaignName: "Summer 2024 Campaign",
          score: 85,
          notes: "Interested in enterprise plan",
          createdAt: "2024-06-15T10:00:00Z",
          updatedAt: "2024-06-20T10:00:00Z",
        },
        {
          id: "2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@techco.com",
          phone: "+1-555-0200",
          company: "TechCo",
          status: "new",
          source: "Referral",
          score: 65,
          createdAt: "2024-06-18T10:00:00Z",
          updatedAt: "2024-06-18T10:00:00Z",
        },
      ]);
      setCampaigns([
        { id: "1", name: "Summer 2024 Campaign" },
        { id: "2", name: "Q4 Enterprise Push" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    if (filters.campaignId) {
      filtered = filtered.filter((lead) => lead.campaignId === filters.campaignId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(search) ||
          lead.lastName.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.company?.toLowerCase().includes(search)
      );
    }

    setFilteredLeads(filtered);
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetails(true);
  };

  const handleEdit = (lead: Lead) => {
    // Open edit dialog (not implemented in this version)
    alert(`Edit lead: ${lead.firstName} ${lead.lastName}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await leadService.delete(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete lead:", err);
      alert("Failed to delete lead. Using mock mode.");
    }
  };

  const handleAssignCampaign = async (leadId: string, campaignId: string) => {
    try {
      await leadService.assignCampaign(leadId, campaignId);
      loadData();
      setAssigningLead(null);
    } catch (err) {
      console.error("Failed to assign campaign:", err);
      alert("Failed to assign campaign. Using mock mode.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Add Lead
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-medium">API Connection Error</p>
          <p>Using mock data for development. Error: {error}</p>
        </div>
      )}

      <LeadFilters filters={filters} campaigns={campaigns} onFilterChange={setFilters} />

      <LeadList
        leads={filteredLeads}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <LeadDetails
        lead={selectedLead}
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedLead(null);
        }}
      />

      {assigningLead && (
        <CampaignAssignment
          leadId={assigningLead.id}
          leadName={`${assigningLead.firstName} ${assigningLead.lastName}`}
          currentCampaignId={assigningLead.campaignId}
          campaigns={campaigns}
          open={true}
          onClose={() => setAssigningLead(null)}
          onAssign={handleAssignCampaign}
        />
      )}
    </div>
  );
}
