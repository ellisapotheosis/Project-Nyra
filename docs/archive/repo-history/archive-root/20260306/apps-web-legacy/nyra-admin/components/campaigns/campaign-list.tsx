"use client";

import { Campaign } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CampaignListProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onViewAnalytics: (id: string) => void;
}

export function CampaignList({ campaigns, onEdit, onDelete, onViewAnalytics }: CampaignListProps) {
  const getStatusVariant = (status: Campaign["status"]) => {
    switch (status) {
      case "active": return "success";
      case "paused": return "warning";
      case "completed": return "info";
      default: return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Campaigns</h2>
          <span className="text-sm text-gray-500">{campaigns.length} total</span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>{campaign.leads || 0}</TableCell>
                <TableCell>{campaign.conversions || 0}</TableCell>
                <TableCell>{new Date(campaign.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onViewAnalytics(campaign.id)}
                      className="text-xs"
                    >
                      Analytics
                    </Button>
                    <Button
                      onClick={() => onEdit(campaign)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(campaign.id)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
