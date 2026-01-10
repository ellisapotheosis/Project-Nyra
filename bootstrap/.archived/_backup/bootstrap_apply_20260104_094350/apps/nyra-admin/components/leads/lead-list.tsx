"use client";

import { Lead } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LeadListProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export function LeadList({ leads, onView, onEdit, onDelete }: LeadListProps) {
  const getStatusVariant = (status: Lead["status"]) => {
    switch (status) {
      case "new": return "info";
      case "contacted": return "warning";
      case "qualified": return "success";
      case "converted": return "success";
      case "lost": return "error";
      default: return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Leads</h2>
          <span className="text-sm text-gray-500">{leads.length} total</span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  {lead.firstName} {lead.lastName}
                </TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.company || "-"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                </TableCell>
                <TableCell>{lead.campaignName || "-"}</TableCell>
                <TableCell>{lead.score || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button onClick={() => onView(lead)} className="text-xs">
                      View
                    </Button>
                    <Button onClick={() => onEdit(lead)} className="text-xs">
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(lead.id)}
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
