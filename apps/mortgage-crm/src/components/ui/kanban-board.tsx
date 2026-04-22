"use client";

import React, { useState, useEffect } from "react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PRE_APPROVED" | "APPLICATION" | "PROCESSING" | "APPROVED" | "CLOSED";

interface Lead {
  id: string;
  status: LeadStatus;
  borrower: {
    firstName: string;
    lastName: string;
  };
  loanRequest?: {
    amount: number;
  };
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: "NEW", title: "New Leads" },
  { id: "CONTACTED", title: "Contacted" },
  { id: "QUALIFIED", title: "Qualified" },
  { id: "PRE_APPROVED", title: "Pre-Approved" },
  { id: "APPLICATION", title: "App Submitted" },
  { id: "PROCESSING", title: "Processing" },
  { id: "APPROVED", title: "Approved" },
  { id: "CLOSED", title: "Closed/Funded" },
];

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch("/api/leads");
        if (response.ok) {
          const data = await response.json();
          setLeads(data);
        }
      } catch (error) {
        console.error("Failed to load leads", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading pipeline data...</div>;
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((lead) => lead.status === col.id);
        
        return (
          <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold text-sm text-gray-700">{col.title}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded-full font-medium">
                {columnLeads.length}
              </span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {columnLeads.map((lead) => (
                <div key={lead.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-pointer hover:border-blue-400 hover:shadow transition-shadow">
                  <div className="font-medium text-gray-800">
                    {lead.borrower.firstName} {lead.borrower.lastName}
                  </div>
                  {lead.loanRequest && (
                    <div className="text-sm text-gray-500 mt-1">
                      ${lead.loanRequest.amount.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
              {columnLeads.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded">
                  No records
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
