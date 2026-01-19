"use client";

import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface LeadFiltersProps {
  filters: {
    status?: string;
    campaignId?: string;
    search?: string;
  };
  campaigns: Array<{ id: string; name: string }>;
  onFilterChange: (filters: any) => void;
}

export function LeadFilters({ filters, campaigns, onFilterChange }: LeadFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Search</label>
            <Input
              value={filters.search || ""}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Name, email, company..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status || ""}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Campaign</label>
            <Select
              value={filters.campaignId || ""}
              onChange={(e) => onFilterChange({ ...filters, campaignId: e.target.value })}
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
