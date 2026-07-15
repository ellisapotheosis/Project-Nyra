"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { crmApi, useApi, Lead } from "@/lib/api";
import { useWebSocket } from "@project-nyra/websocket-client/react";

type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "NURTURING"
  | "APPLICATION_STARTED"
  | "DOCS_NEEDED"
  | "SUBMITTED"
  | "APPROVED"
  | "CLEAR_TO_CLOSE"
  | "FUNDED"
  | "LOST"
  | "DO_NOT_CONTACT";

interface Column {
  id: LeadStage;
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  {
    id: "NEW",
    title: "New Leads",
    color: "border-t-indigo-500 text-indigo-400",
  },
  {
    id: "CONTACTED",
    title: "Contacted",
    color: "border-t-teal-400 text-teal-400",
  },
  {
    id: "NURTURING",
    title: "Nurturing",
    color: "border-t-purple-500 text-purple-400",
  },
  {
    id: "APPLICATION_STARTED",
    title: "App Started",
    color: "border-t-pink-500 text-pink-400",
  },
  {
    id: "DOCS_NEEDED",
    title: "Docs Needed",
    color: "border-t-orange-400 text-orange-400",
  },
  {
    id: "SUBMITTED",
    title: "Submitted",
    color: "border-t-yellow-500 text-yellow-400",
  },
  {
    id: "APPROVED",
    title: "Approved",
    color: "border-t-green-500 text-green-400",
  },
  {
    id: "CLEAR_TO_CLOSE",
    title: "Clear to Close",
    color: "border-t-emerald-400 text-emerald-400",
  },
  {
    id: "FUNDED",
    title: "Funded/Closed",
    color: "border-t-slate-400 text-slate-400",
  },
  { id: "LOST", title: "Lost", color: "border-t-rose-500 text-rose-400" },
];

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);

  // Initialize the REST API leads fetcher
  const leadsApi = useApi(crmApi.getLeads);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await crmApi.getLeads();
      if (res && res.leads) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Connect to live WebSocket Hub for real-time GraphQL updates
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
  const { connected, subscribe, events } = useWebSocket(wsUrl, {
    autoConnect: true,
  });

  // Subscribe to real-time CRM updates
  useEffect(() => {
    if (connected) {
      subscribe("crm:leads").catch((err) =>
        console.error("Failed to subscribe to leads channel:", err)
      );
    }
  }, [connected, subscribe]);

  // Handle incoming real-time lead updates from websocket subscription
  useEffect(() => {
    if (events.length > 0) {
      const lastEvent = events[events.length - 1] as any;
      if (lastEvent && lastEvent.type === "lead:updated") {
        const updatedLead = lastEvent.data as Lead;
        setLeads((prevLeads) => {
          const index = prevLeads.findIndex((l) => l.id === updatedLead.id);
          if (index !== -1) {
            const newLeads = [...prevLeads];
            newLeads[index] = { ...newLeads[index], ...updatedLead };
            return newLeads;
          }
          return [...prevLeads, updatedLead];
        });
      } else if (lastEvent && lastEvent.type === "lead:created") {
        const newLead = lastEvent.data as Lead;
        setLeads((prevLeads) => {
          if (prevLeads.some((l) => l.id === newLead.id)) return prevLeads;
          return [...prevLeads, newLead];
        });
      }
    }
  }, [events]);

  // Handle drag and drop operation
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as LeadStage;

    // Optimistic UI Update
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === draggableId ? { ...lead, stage: newStage } : lead
      )
    );

    // Save update to backend Twenty CRM API
    try {
      setMovingId(draggableId);
      await crmApi.updateLeadStatus(draggableId, newStage);
    } catch (err) {
      console.error(`Failed to update lead status for ${draggableId}:`, err);
      // Revert on error by refetching
      fetchLeads();
    } finally {
      setMovingId(null);
    }
  };

  // Manual move helper for non-DnD accessibility
  const handleManualMove = async (leadId: string, currentStage: LeadStage) => {
    const currentIndex = COLUMNS.findIndex((col) => col.id === currentStage);
    const nextCol = COLUMNS[currentIndex + 1];
    if (!nextCol) return;

    // Optimistically update
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, stage: nextCol.id } : lead
      )
    );

    try {
      setMovingId(leadId);
      await crmApi.updateLeadStatus(leadId, nextCol.id);
    } catch (err) {
      console.error(`Failed to manual move lead status:`, err);
      fetchLeads();
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              connected ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {connected
              ? "Live Ledger Subscriptions Active (WebSocket)"
              : "Reconnecting to Live Ledger Subscriptions..."}
          </span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {COLUMNS.map((col) => {
            // Support both exact or uppercase stage representations
            const columnLeads = leads.filter(
              (lead) =>
                lead.stage === col.id ||
                lead.stage?.toUpperCase() === col.id ||
                (col.id === "NEW" && !lead.stage)
            );

            return (
              <div
                key={col.id}
                className="flex w-72 shrink-0 flex-col rounded-2xl bg-zinc-950/40 border border-zinc-900/60 p-3"
              >
                <div
                  className={`mb-3 border-t-2 ${col.color} pt-2 px-1 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm tracking-tight capitalize">
                      {col.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-1.5 py-0 text-xs"
                    >
                      {columnLeads.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 space-y-3 min-h-[300px] overflow-y-auto pr-1"
                    >
                      {columnLeads.map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(providedDrag, snapshot) => (
                            <div
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              style={providedDrag.draggableProps.style as any}
                              className={`group relative rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700/80 hover:shadow-lg ${
                                snapshot.isDragging
                                  ? "border-primary bg-zinc-900/90 shadow-2xl scale-105"
                                  : ""
                              } ${movingId === lead.id ? "opacity-40 pointer-events-none" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm text-slate-100 group-hover:text-primary transition-colors">
                                  {lead.firstName || lead.name
                                    ? `${lead.firstName || lead.name} ${lead.lastName || ""}`
                                    : "Unknown Lead"}
                                </h4>
                                {lead.stage?.toUpperCase() === "NEW" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0"
                                  >
                                    New
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold tracking-tighter text-teal-400">
                                    {lead.loanAmount
                                      ? `$${Math.round(lead.loanAmount / 1000).toLocaleString()}k`
                                      : "$0k"}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-zinc-900/80 border-zinc-800 text-zinc-400 capitalize"
                                  >
                                    {lead.loanPurpose
                                      ?.replace("_", " ")
                                      .toLowerCase() || "General"}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                                  {lead.phone && (
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-primary/20 hover:text-primary text-zinc-400 transition-colors"
                                      title={lead.phone}
                                    >
                                      <Phone className="size-3.5" />
                                    </a>
                                  )}
                                  {lead.email && (
                                    <a
                                      href={`mailto:${lead.email}`}
                                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-primary/20 hover:text-primary text-zinc-400 transition-colors"
                                      title={lead.email}
                                    >
                                      <Mail className="size-3.5" />
                                    </a>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 ml-auto text-zinc-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      handleManualMove(lead.id, col.id)
                                    }
                                    title="Move to Next Stage"
                                  >
                                    <ChevronRight className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnLeads.length === 0 && (
                        <div className="h-24 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-xs font-medium">
                          No leads
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
