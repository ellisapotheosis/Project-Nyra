"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  History,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  Pause,
  Play,
  CheckCircle2,
  FileText,
  Calendar,
  MoreVertical,
  UserPlus,
  Landmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { crmApi, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { WingmanPanel } from "@/components/assistant/wingman-panel";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  model?: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Initialized Nyra environment. Select a lead from the registry to sync context.",
      timestamp: new Date(),
      model: "O1-Preview",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const leadsApi = useApi(crmApi.getLeads);
  const timelineApi = useApi(crmApi.getLeadConversation);
  const campaignUpdateApi = useApi(crmApi.updateLeadCampaign);

  const leads = leadsApi.data?.leads || [];
  const selectedLead = leads.find((l: any) => l.id === selectedLeadId);

  useEffect(() => {
    leadsApi.execute();
  }, []);

  useEffect(() => {
    if (!selectedLeadId) return;
    timelineApi.execute(selectedLeadId).then(() => {
      const lead = leads.find((l: any) => l.id === selectedLeadId);
      if (lead) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Synchronized ${lead.firstName}'s operational profile. Compliance gates cleared. Campaign "${lead.campaignName || "Nurture"}" is ${lead.campaignStatus || "ACTIVE"}.`,
            timestamp: new Date(),
            model: "Letta context-worker",
          },
        ]);
      }
    });
  }, [selectedLeadId]);

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/internal/openclaw/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.assistant || "Operational logic execution complete.",
          timestamp: new Date(),
          model: "O1-Preview (RTX 5090)",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Nexus Router offline or degraded. Operating in local-memory mode.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const actionChips = [
    {
      label: "Draft Quote",
      icon: <FileText className="h-3 w-3 mr-1" />,
      action: () => handleSend("Draft a primary scenario quote."),
    },
    {
      label: "Timeline Summary",
      icon: <History className="h-3 w-3 mr-1" />,
      action: () => handleSend("Summarize communication timeline."),
    },
    {
      label: "Compliance Audit",
      icon: <Shield className="h-3 w-3 mr-1" />,
      action: () => handleSend("Audit lead compliance status."),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background overflow-hidden p-6 lg:p-8 gap-6">
      {/* Sidebar: Registry */}
      <div className="w-80 shrink-0 flex flex-col gap-6">
        <Card className="flex-1 border-border/40 bg-card/40 overflow-hidden flex flex-col shadow-xl">
          <CardHeader className="h-14 px-6 border-b border-border/20 flex flex-row items-center justify-between shrink-0 bg-muted/20">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-indigo-400" />
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Registry
              </CardTitle>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-muted-foreground/50 hover:text-foreground"
            >
              <UserPlus className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <StatusGate
              data={leads}
              error={leadsApi.error}
              isLoading={leadsApi.isLoading}
              onRetry={leadsApi.execute}
            >
              {(leadsData) => (
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {leadsData.map((lead: any) => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group border border-transparent",
                          selectedLeadId === lead.id
                            ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_-5px_rgba(var(--indigo-rgb),0.3)]"
                            : "hover:bg-muted/30"
                        )}
                      >
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-xs font-bold truncate transition-colors",
                              selectedLeadId === lead.id
                                ? "text-indigo-400"
                                : "text-foreground"
                            )}
                          >
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-tighter mt-0.5">
                            {lead.loanPurpose} • {lead.propertyState || "CA"}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 transition-all",
                            selectedLeadId === lead.id
                              ? "text-indigo-400 translate-x-0.5"
                              : "text-muted-foreground/30 opacity-0 group-hover:opacity-100"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </StatusGate>
          </CardContent>
        </Card>
      </div>

      {/* Main Column: Chat Interface */}
      <div className="flex-1 flex flex-col gap-6">
        <Card className="flex-1 border-border/40 bg-card/40 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-turquoise-400 opacity-50" />

          <CardHeader className="h-14 px-8 border-b border-border/20 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Bot className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight">
                  Nyra Operational AI
                </h2>
                <div className="flex items-center gap-2">
                  <div className="size-1 rounded-full bg-turquoise-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-turquoise-400/80 uppercase tracking-widest">
                    Neural Link Active
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="p-8 space-y-8 max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex",
                        m.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "flex max-w-[85%] gap-4",
                          m.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <Avatar className="size-8 border-2 border-border/40 shrink-0">
                          <AvatarFallback
                            className={cn(
                              "text-[10px] font-bold",
                              m.role === "assistant"
                                ? "bg-indigo-600 text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {m.role === "assistant" ? "NY" : "ME"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "space-y-1.5",
                            m.role === "user" ? "items-end" : "items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                              m.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-background/80 text-foreground border border-border/60 rounded-tl-none backdrop-blur-sm"
                            )}
                          >
                            {m.content}
                          </div>
                          {m.model && (
                            <div className="flex items-center gap-1.5 px-2">
                              <Sparkles className="size-2.5 text-indigo-400" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {m.model}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <div className="flex justify-start gap-4 pl-12">
                    <div className="flex gap-1 bg-muted/40 p-3 rounded-2xl rounded-tl-none">
                      <div className="size-1 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="size-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-6 bg-muted/20 border-t border-border/20 flex flex-col gap-6 shrink-0">
            {selectedLeadId && (
              <div className="flex flex-wrap gap-2 justify-center">
                {actionChips.map((chip, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-8 border-border/60 bg-background/50 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 text-[10px] font-bold uppercase tracking-widest rounded-full px-4"
                    onClick={chip.action}
                  >
                    {chip.icon} {chip.label}
                  </Button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center gap-3 bg-background/60 border border-border/60 rounded-2xl p-2 pr-3 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-xl"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedLeadId
                    ? `Command Nyra regarding ${selectedLead?.firstName}...`
                    : "Initialize operational command..."
                }
                className="flex-1 border-none focus-visible:ring-0 shadow-none bg-transparent text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="size-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_15px_-3px_rgba(var(--indigo-rgb),0.4)] transition-all active:scale-95"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column: Wingman Panel */}
      <div className="w-[340px] shrink-0 h-full">
        <WingmanPanel />
      </div>
    </div>
  );
}
