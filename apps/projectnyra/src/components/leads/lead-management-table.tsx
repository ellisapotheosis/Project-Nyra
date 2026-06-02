"use client";

import React from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LeadRecord } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface LeadManagementTableProps {
  leads: LeadRecord[];
}

// Add these to match the admin dashboard style
const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "NEW":
      return "text-turquoise-400 border-turquoise-400/20 bg-turquoise-400/10";
    case "CONTACTED":
      return "text-indigo-400 border-indigo-400/20 bg-indigo-400/10";
    case "QUALIFIED":
      return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
    case "APPLICATION":
      return "text-pink-400 border-pink-400/20 bg-pink-400/10";
    case "CLOSED":
      return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
    default:
      return "text-muted-foreground border-border bg-muted/10";
  }
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    case "B":
      return "text-indigo-400 border-indigo-400/30 bg-indigo-400/10";
    case "C":
      return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    case "D":
      return "text-rose-400 border-rose-400/30 bg-rose-400/10";
    default:
      return "text-muted-foreground border-border bg-muted/10";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100); // Assuming cents based on projectnyra mock data
};

export function LeadManagementTable({ leads }: LeadManagementTableProps) {
  return (
    <Card className="border-border/40 bg-card/40">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Leads Overview
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="h-9 w-full md:w-64 border-border/40 bg-muted/20 pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => {
            // Derived fields for mock demonstration (since we haven't updated the type yet)
            const leadScore = Math.floor(Math.random() * 30) + 70;
            const leadGrade =
              leadScore >= 90 ? "A" : leadScore >= 80 ? "B" : "C";

            return (
              <div
                key={lead.id}
                className="group relative rounded-xl border border-border/40 bg-card/20 p-4 transition-all hover:bg-card/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 items-center gap-4">
                    {/* Avatar/Initial */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-turquoise-400 to-indigo-400 text-lg font-bold text-white shadow-lg">
                      {lead.firstName[0]}
                      {lead.lastName[0]}
                    </div>

                    {/* Name & Email */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-foreground hover:text-turquoise-400 transition-colors"
                        >
                          {lead.firstName} {lead.lastName}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="bg-muted/50 text-[10px] font-bold uppercase tracking-tighter"
                        >
                          {lead.source}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {lead.email}
                      </p>
                    </div>

                    {/* Desktop Details */}
                    <div className="hidden xl:flex items-center gap-8 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-turquoise-400" />
                        <span className="font-medium text-foreground">
                          {formatCurrency(lead.loanAmount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-indigo-400" />
                        <span>{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-pink-400" />
                        <span>{lead.lastTouch}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6">
                    {/* Score & Grade */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Score
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {leadScore}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "h-7 px-3 border font-bold",
                          getGradeColor(leadGrade)
                        )}
                      >
                        Grade {leadGrade}
                      </Badge>
                    </div>

                    {/* Stage/Status */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-7 px-3 font-bold uppercase tracking-tighter",
                        getStatusColor(lead.stage)
                      )}
                    >
                      {lead.stage}
                    </Badge>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-turquoise-400"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-turquoise-400"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Link href={`/leads/${lead.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-turquoise-400"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Mobile/Tablet Details Extension */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/20 pt-4 xl:hidden">
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="h-3.5 w-3.5 text-turquoise-400" />
                    <span className="text-muted-foreground">Loan:</span>
                    <span className="font-medium">
                      {formatCurrency(lead.loanAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="truncate">{lead.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
