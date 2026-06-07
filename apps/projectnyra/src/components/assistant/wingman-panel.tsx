"use client";

import React, { useState } from "react";
import { Brain, Cpu, Database, History, Info, Key, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function WingmanPanel() {
  const [memoryItems, setMemoryItems] = useState([
    {
      type: "core",
      content: "Borrower prefers SMS communication after 6 PM.",
      strength: 100,
    },
    {
      type: "context",
      content: "Last quote viewed: 30Y Fixed @ 6.25%",
      strength: 85,
    },
    {
      type: "interaction",
      content: "Expressed concern about down payment closing costs.",
      strength: 70,
    },
  ]);

  return (
    <Card className="h-full border-border/40 bg-card/60 backdrop-blur-xl flex flex-col overflow-hidden">
      <CardHeader className="h-14 px-6 border-b border-border/20 flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Brain className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold tracking-tight">
              Assistant Wingman
            </CardTitle>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
              Letta / OpenMemory Context
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="h-5 text-[9px] border-turquoise-500/20 bg-turquoise-500/5 text-turquoise-400 font-bold uppercase tracking-widest"
        >
          Active
        </Badge>
      </CardHeader>

      <div className="p-4 grid grid-cols-2 gap-2 border-b border-border/10 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-border/20">
          <Cpu className="size-3 text-indigo-400" />
          <span className="text-[10px] font-bold text-muted-foreground">
            O1-Preview
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-border/20">
          <Database className="size-3 text-turquoise-400" />
          <span className="text-[10px] font-bold text-muted-foreground">
            12 Mem-Tags
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-1">
              Retrieved Intelligence
            </h4>
            {memoryItems.map((item, i) => (
              <div
                key={i}
                className="group relative p-3 rounded-xl border border-border/30 bg-background/40 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 size-1.5 rounded-full shadow-[0_0_8px]",
                      item.type === "core"
                        ? "bg-indigo-400 shadow-indigo-400/50"
                        : "bg-turquoise-400 shadow-turquoise-400/50"
                    )}
                  />
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {item.content}
                  </p>
                </div>
                <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="size-3 text-muted-foreground/40 hover:text-indigo-400 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button className="w-full h-8 rounded-lg border border-border/40 bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-all flex items-center justify-center gap-2">
              <History className="size-3" />
              Recall Full Timeline
            </button>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/20 bg-muted/20 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="size-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
              Ready for Suggestion
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-1 rounded-full bg-turquoise-400" />
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
              Sync Instant
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
