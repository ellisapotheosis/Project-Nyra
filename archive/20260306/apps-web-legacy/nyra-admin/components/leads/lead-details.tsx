"use client";

import { Lead } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface LeadDetailsProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetails({ lead, open, onClose }: LeadDetailsProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="info">{lead.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{lead.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{lead.company || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{lead.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Campaign</p>
                  <p className="font-medium">{lead.campaignName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="font-medium">{lead.score || "-"}</p>
                </div>
              </div>
              {lead.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="mt-1">{lead.notes}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <p>Created: {new Date(lead.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(lead.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
