"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "./badge";
import { Card, CardHeader, CardContent } from "./card";
import {
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  AlertCircle
} from "lucide-react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PRE_APPROVED" | "APPLICATION" | "PROCESSING" | "APPROVED" | "CLOSED";

interface Lead {
  id: string;
  status: LeadStatus;
  borrower: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  loanRequest?: {
    amount: number;
    propertyType: string;
  };
  createdAt: string;
}

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: "NEW", title: "New Leads", color: "bg-blue-500" },
  { id: "CONTACTED", title: "Contacted", color: "bg-indigo-500" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-purple-500" },
  { id: "PRE_APPROVED", title: "Pre-Approved", color: "bg-pink-500" },
  { id: "APPLICATION", title: "App Submitted", color: "bg-orange-500" },
  { id: "PROCESSING", title: "Processing", color: "bg-yellow-500" },
  { id: "APPROVED", title: "Approved", color: "bg-green-500" },
  { id: "CLOSED", title: "Closed/Funded", color: "bg-slate-500" },
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-6 scrollbar-hide">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((lead) => lead.status === col.id);

        return (
          <div key={col.id} className="w-80 flex-shrink-0 flex flex-col group">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">{col.title}</h3>
                <span className="text-slate-400 text-xs font-bold">({columnLeads.length})</span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 min-h-[200px] overflow-y-auto pr-1">
              {columnLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {columnLeads.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const isUrgent = lead.status === "NEW"; // Simple logic for demo

  return (
    <Card className="hover:shadow-md transition-all cursor-grab active:cursor-grabbing group border-slate-200 overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {lead.borrower.firstName} {lead.borrower.lastName}
          </h4>
          {isUrgent && (
            <Badge variant="outline" className="bg-red-50 border-red-100 text-red-600 text-[10px] uppercase font-bold px-1.5 py-0">
              Urgent
            </Badge>
          )}
        </div>

        <div className="space-y-2 mt-3">
          {lead.loanRequest && (
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-800 tracking-tighter">
                ${(lead.loanRequest.amount / 1000).toFixed(0)}k
              </span>
              <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 border-slate-200 text-slate-500 uppercase">
                {lead.loanRequest.propertyType.replace('_', ' ')}
              </Badge>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Phone size={14} />
            </button>
            <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Mail size={14} />
            </button>
            <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Calendar size={14} />
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Created 2d ago</span>
          <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
