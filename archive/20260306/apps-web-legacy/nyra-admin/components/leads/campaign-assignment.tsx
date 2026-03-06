"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CampaignAssignmentProps {
  leadId: string;
  leadName: string;
  currentCampaignId?: string;
  campaigns: Array<{ id: string; name: string }>;
  open: boolean;
  onClose: () => void;
  onAssign: (leadId: string, campaignId: string) => void;
}

export function CampaignAssignment({
  leadId,
  leadName,
  currentCampaignId,
  campaigns,
  open,
  onClose,
  onAssign,
}: CampaignAssignmentProps) {
  const [selectedCampaign, setSelectedCampaign] = useState(currentCampaignId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCampaign) {
      onAssign(leadId, selectedCampaign);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assign <span className="font-medium">{leadName}</span> to a campaign
            </p>
            <div>
              <label className="text-sm font-medium">Campaign</label>
              <Select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                required
              >
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={onClose} className="bg-gray-100 text-gray-700">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
