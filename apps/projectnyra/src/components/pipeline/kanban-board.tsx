"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { crmApi, useApi } from "@/lib/api";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PRE_APPROVED"
  | "APPLICATION"
  | "PROCESSING"
  | "APPROVED"
  | "CLOSED";

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

const COLUMNS: {
  id: LeadStatus;
  title: string;
  color: string;
  shadow: string;
}[] = [
  {
    id: "NEW",
    title: "New Leads",
    color: "bg-indigo-500",
    shadow: "shadow-[0_0_10px_rgba(99,102,241,0.5)]",
  },
  {
    id: "CONTACTED",
    title: "Contacted",
    color: "bg-turquoise-400",
    shadow: "shadow-[0_0_10px_rgba(20,184,166,0.5)]",
  },
  {
    id: "QUALIFIED",
    title: "Qualified",
    color: "bg-indigo-400",
    shadow: "shadow-[0_0_10px_rgba(129,140,248,0.5)]",
  },
  {
    id: "PRE_APPROVED",
    title: "Pre-Approved",
    color: "bg-turquoise-500",
    shadow: "shadow-[0_0_10px_rgba(20,184,166,0.6)]",
  },
  {
    id: "APPLICATION",
    title: "Application",
    color: "bg-pink-400",
    shadow: "shadow-[0_0_10px_rgba(244,63,94,0.5)]",
  },
  {
    id: "PROCESSING",
    title: "Processing",
    color: "bg-indigo-600",
    shadow: "shadow-[0_0_10px_rgba(79,70,229,0.5)]",
  },
  {
    id: "APPROVED",
    title: "Approved",
    color: "bg-turquoise-600",
    shadow: "shadow-[0_0_10px_rgba(13,148,136,0.5)]",
  },
  {
    id: "CLOSED",
    title: "Closed/Funded",
    color: "bg-slate-600",
    shadow: "shadow-[0_0_10px_rgba(71,85,105,0.5)]",
  },
];

// ─── Sortable card wrapper ────────────────────────────────────────────────────

interface SortableCardProps {
  id: string;
  children: React.ReactNode;
}

function SortableCard({ id, children }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// ─── Lead card content ────────────────────────────────────────────────────────

function LeadCard({ lead }: { lead: Lead }) {
  const isUrgent = lead.status === "NEW";

  return (
    <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:border-indigo-500/30 transition-all cursor-grab active:cursor-grabbing group overflow-hidden rounded-[24px] shadow-lg border-t-2 border-t-indigo-500/20">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
              {lead.borrower.firstName} {lead.borrower.lastName}
            </h4>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-40">
              TRK_{lead.id.substring(0, 4)}
            </p>
          </div>
          {isUrgent && (
            <Badge className="bg-pink-500/20 text-pink-400 border-none text-[8px] uppercase font-black px-1.5 py-0 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
              URGENT
            </Badge>
          )}
        </div>

        <div className="space-y-4 mt-5">
          {lead.loanRequest && (
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform">
                ${(lead.loanRequest.amount / 1000).toFixed(0)}k
              </span>
              <Badge
                variant="outline"
                className="text-[8px] font-black bg-indigo-500/5 border-indigo-500/20 text-indigo-400 uppercase tracking-widest px-2 py-0.5"
              >
                {lead.loanRequest.propertyType}
              </Badge>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <button className="p-2 rounded-xl bg-background/60 border border-border/40 text-muted-foreground hover:text-turquoise-400 hover:border-turquoise-500/30 transition-all shadow-inner">
              <Phone size={12} />
            </button>
            <button className="p-2 rounded-xl bg-background/60 border border-border/40 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-inner">
              <Mail size={12} />
            </button>
            <button className="flex-1 flex items-center justify-between p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 px-4">
              <span className="text-[8px] font-black uppercase tracking-widest">
                Orchestrate
              </span>
              <ArrowRight size={10} />
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
          <div className="flex items-center gap-1.5">
            <Clock size={10} />
            <span>2D_AGO</span>
          </div>
          <div className="flex -space-x-1.5">
            <div className="size-4 rounded-full bg-indigo-500/20 border border-indigo-500/40" />
            <div className="size-4 rounded-full bg-turquoise-500/20 border border-turquoise-500/40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main board ───────────────────────────────────────────────────────────────

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeCard, setActiveCard] = useState<Lead | null>(null);
  const leadsApi = useApi(crmApi.getLeads);

  useEffect(() => {
    leadsApi.execute();
  }, []);

  useEffect(() => {
    if (leadsApi.data) {
      const mappedLeads = (leadsApi.data.leads || []).map((l: any) => ({
        id: l.id,
        status: l.stage || "NEW",
        borrower: {
          firstName: l.firstName,
          lastName: l.lastName,
          email: l.email,
          phone: l.phone,
        },
        loanRequest: {
          amount: l.loanAmount || 0,
          propertyType: l.loanPurpose || "PURCHASE",
        },
        createdAt: l.createdAt,
      }));
      setLeads(mappedLeads);
    }
  }, [leadsApi.data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const dragged = leads.find((l) => l.id === event.active.id);
    setActiveCard(dragged ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Determine target column: over.id can be a column id or another card's id
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    const targetStatus: LeadStatus | undefined = targetColumn
      ? targetColumn.id
      : (leads.find((l) => l.id === overId)?.status as LeadStatus | undefined);

    if (!targetStatus) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === cardId ? { ...l, status: targetStatus } : l))
    );
  }

  if (leadsApi.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-20rem)] gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter((lead) => lead.status === col.id);
          const columnCardIds = columnLeads.map((l) => l.id);

          return (
            <div
              key={col.id}
              className="w-80 flex-shrink-0 flex flex-col group"
              // Make the column droppable by giving it the column id
              data-id={col.id}
            >
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      col.color,
                      col.shadow
                    )}
                  />
                  <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    {col.title}
                  </h3>
                  <span className="text-muted-foreground/40 text-[10px] font-black">
                    {columnLeads.length}
                  </span>
                </div>
                <button className="text-muted-foreground/40 hover:text-indigo-400 transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>

              <SortableContext
                id={col.id}
                items={columnCardIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-5 min-h-[200px] overflow-y-auto pr-1">
                  {columnLeads.map((lead) => (
                    <SortableCard key={lead.id} id={lead.id}>
                      <LeadCard lead={lead} />
                    </SortableCard>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/40 rounded-3xl text-muted-foreground/20 text-[9px] font-black uppercase tracking-widest bg-indigo-500/5">
                      IDLE_QUEUE
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div
            style={{
              boxShadow:
                "0 0 20px rgba(80,56,255,0.4), 0 20px 40px rgba(0,0,0,0.5)",
              transform: "rotate(2deg)",
              opacity: 0.95,
            }}
          >
            <LeadCard lead={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
