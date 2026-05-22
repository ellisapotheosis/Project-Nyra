"use client";

import React from "react";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CampaignControlPanelProps {
  campaignName?: string;
  campaignStatus?: string;
  onPauseResume: () => void;
  onStop: () => void;
  isLoading?: boolean;
}

export function CampaignControlPanel({
  campaignName,
  campaignStatus,
  onPauseResume,
  onStop,
  isLoading,
}: CampaignControlPanelProps) {
  return (
    <div className="pt-4 border-t border-border/40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <Play className="size-3" />
          Campaign Orchestration
        </h3>
      </div>
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-300">
              {campaignName || "Refinance Blitz"}
            </p>
            <p className="text-[10px] text-indigo-300/60 uppercase tracking-tighter mt-0.5">
              Step 3 of 5 • Next in 14h
            </p>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            {campaignStatus || "ACTIVE"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-[10px] font-bold uppercase"
            onClick={onPauseResume}
            disabled={isLoading}
          >
            {campaignStatus === "ACTIVE" ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-[10px] font-bold uppercase"
            onClick={onStop}
            disabled={isLoading}
          >
            Stop
          </Button>
        </div>
      </div>
    </div>
  );
}
