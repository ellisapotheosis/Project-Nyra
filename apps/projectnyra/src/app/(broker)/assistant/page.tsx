"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Input } from "@nyra/ui";
import { Badge } from "@nyra/ui";
import { ScrollArea } from "@nyra/ui";
import { Avatar, AvatarFallback } from "@nyra/ui";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Glow } from "@nyra/ui";

import { crmApi, useApi } from "@/lib/api";
import { ComplianceHeatStrip } from "@/components/status/compliance-heat-strip";
import { StatusGate } from "@nyra/ui";

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
        "HUB_TERMINAL_ONLINE: I'm Nyra, your AI Mortgage Assistant. Select a registry entry to begin orchestration.",
      timestamp: new Date(),
      model: "Hermes 3 Pro",
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
  const timeline = timelineApi.data?.logs || [];

  const activeWorker =
    (selectedLead?.loanAmount || 0) > 5000000
      ? {
          id: "5090",
          name: "WORKER_RTX_5090",
          color: "text-pink-400",
          badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        }
      : {
          id: "3090",
          name: "WORKER_RTX_3090_TI",
          color: "text-indigo-400",
          badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        };

  // Fetch Leads on Mount
  useEffect(() => {
    leadsApi.execute();
  }, []);

  // Fetch Timeline when Lead selected
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
            content: `PROTOCOL_INITIALIZED: Loaded ${lead.firstName}'s context. Status: ${lead.campaignStatus}. Mortgage intent detected. Awaiting command buffer.`,
            timestamp: new Date(),
            model: "Hermes 3 Pro (Orchestrator)",
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
          content: data.assistant || "Error processing request.",
          timestamp: new Date(),
          model: `Hermes 3 Pro (${activeWorker.name})`,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "NEXUS_ROUTER_OFFLINE: Reverting to local fallback buffer.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateCampaignStatus = async (status: string) => {
    if (!selectedLeadId) return;
    try {
      await campaignUpdateApi.execute(selectedLeadId, status);
      leadsApi.execute(); // Refresh leads to get updated status
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `LOG: Updated campaign enrollment to [${status}].`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "sms":
        return <MessageSquare className="h-3 w-3" />;
      case "email":
        return <Mail className="h-3 w-3" />;
      case "voice":
        return <Phone className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const actionChips = [
    {
      label: "DISPATCH_QUOTE",
      icon: <FileText className="h-3 w-3 mr-1" />,
      action: () => handleSend("Generate a 3-option quote comparison."),
    },
    {
      label: "SUMMARIZE_CONVO",
      icon: <History className="h-3 w-3 mr-1" />,
      action: () => handleSend("Summarize communication history."),
    },
    {
      label: "AUDIT_COMPLIANCE",
      icon: <Shield className="h-3 w-3 mr-1" />,
      action: () => handleSend("Check TCPA compliance status."),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-8 overflow-hidden p-2">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-8 h-full">
        {/* Lead Selection */}
        <ComplianceHeatStrip
          surface="assistant"
          className="border border-turquoise-500/20 bg-card/40 shadow-xl backdrop-blur-md shrink-0 rounded-[24px]"
        />

        <Card className="border border-border/50 shadow-2xl bg-card/40 backdrop-blur-md shrink-0 border-t-2 border-t-indigo-500 overflow-hidden rounded-[24px]">
          <CardHeader className="p-4 pb-3 bg-indigo-500/5 border-b border-border/50">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between text-indigo-400">
              <span className="flex items-center">
                <Search className="mr-2 h-3.5 w-3.5" /> REGISTRY_INGRESS
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-indigo-400 transition-colors"
              >
                <UserPlus className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <StatusGate
              data={leads}
              error={leadsApi.error}
              isLoading={leadsApi.isLoading}
              onRetry={leadsApi.execute}
              isEmpty={(d) => d.length === 0}
              loadingMessage="SYNCING_REGISTRY..."
              emptyMessage="No leads found."
            >
              {(leadsData) => (
                <ScrollArea className="h-44">
                  <div className="space-y-1 p-2">
                    {leadsData.map((lead: any) => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group border ${
                          selectedLeadId === lead.id
                            ? "bg-indigo-500/10 border-indigo-500/30 shadow-inner"
                            : "hover:bg-indigo-500/5 border-transparent hover:border-indigo-500/10"
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-black truncate uppercase tracking-tight ${selectedLeadId === lead.id ? "text-indigo-400" : "text-foreground"}`}
                          >
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            {lead.loanPurpose}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-3 w-3 transition-all ${selectedLeadId === lead.id ? "text-indigo-400 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`}
                        />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </StatusGate>
          </CardContent>
        </Card>

        {/* Selected Lead Details & Actions */}
        {selectedLead && (
          <Card className="border border-turquoise-500/20 shadow-2xl bg-card/40 backdrop-blur-md border-l-4 border-l-turquoise-500 shrink-0 animate-in fade-in slide-in-from-left-2 duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-5 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h3>
                  <p className="text-[10px] font-bold text-turquoise-400 uppercase tracking-widest mt-1">
                    {selectedLead.loanPurpose} • $
                    {((selectedLead.loanAmount || 0) / 10000).toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-turquoise-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0">
                  {selectedLead.campaignStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-[9px] font-black uppercase tracking-widest border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-xl"
                  onClick={() =>
                    updateCampaignStatus(
                      selectedLead.campaignStatus === "ACTIVE"
                        ? "PAUSED"
                        : "ACTIVE"
                    )
                  }
                  disabled={campaignUpdateApi.isLoading}
                >
                  {selectedLead.campaignStatus === "ACTIVE" ? (
                    <Pause className="h-3 w-3 mr-1.5" />
                  ) : (
                    <Play className="h-3 w-3 mr-1.5" />
                  )}
                  {selectedLead.campaignStatus === "ACTIVE"
                    ? "PAUSE"
                    : "RESUME"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-[9px] font-black uppercase tracking-widest border-turquoise-500/20 bg-turquoise-500/5 hover:bg-turquoise-500/10 hover:text-turquoise-400 rounded-xl"
                  onClick={() => updateCampaignStatus("COMPLETE")}
                  disabled={campaignUpdateApi.isLoading}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1.5" /> CLOSED
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Letta Memory Inspector */}
        {selectedLeadId && (
          <Card className="border border-indigo-500/20 shadow-2xl bg-card/40 backdrop-blur-md border-l-4 border-l-indigo-500 shrink-0 animate-in zoom-in-95 rounded-xl overflow-hidden">
            <CardHeader className="p-4 pb-2 bg-indigo-500/5 border-b border-border/50">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center">
                <Bot className="mr-2 h-3.5 w-3.5" /> LETTA_WORKING_MEMORY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground bg-background/50 p-3 rounded-xl border border-border/30 shadow-inner group hover:bg-background/80 transition-colors">
                  <p className="text-indigo-400 mb-1.5 font-black uppercase tracking-widest">
                    MEM_01
                  </p>
                  "Lead prefers {selectedLead?.loanPurpose} scenarios."
                </div>
                <div className="text-[10px] font-bold text-muted-foreground bg-background/50 p-3 rounded-xl border border-border/30 shadow-inner group hover:bg-background/80 transition-colors opacity-60">
                  <p className="text-indigo-400 mb-1.5 font-black uppercase tracking-widest">
                    MEM_02
                  </p>
                  "High credit confidence detected."
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="flex-1 border border-border/50 shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden flex flex-col border-b-2 border-b-pink-500 min-h-[150px] rounded-[24px]">
          <CardHeader className="p-4 pb-3 shrink-0 border-b border-border/50 bg-background/20">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center text-pink-400">
              <History className="mr-2 h-4 w-4" /> RECENT_TRACE_LOGS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {!selectedLeadId ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 opacity-20 h-full">
                <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 shadow-inner">
                  <Clock className="h-12 w-12" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  IDLE_HUB_STATE
                </p>
              </div>
            ) : (
              <StatusGate
                data={timeline}
                error={timelineApi.error}
                isLoading={timelineApi.isLoading}
                onRetry={() => timelineApi.execute(selectedLeadId)}
                isEmpty={(d) => d.length === 0}
                loadingMessage="RETRIEVING_ACTIVITY..."
                emptyMessage="No activity logs found."
              >
                {(timelineData) => (
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-8">
                      {timelineData.map((event: any, i: number) => (
                        <div key={i} className="relative pl-8 pb-2 group/event">
                          {i !== timelineData.length - 1 && (
                            <div className="absolute left-[7px] top-6 bottom-0 w-[1px] bg-border/40" />
                          )}
                          <div
                            className={`absolute left-0 top-1.5 w-4 h-4 rounded bg-background border flex items-center justify-center z-10 shadow-lg ${event.direction === "outbound" ? "text-turquoise-400 border-turquoise-500/30" : "text-indigo-400 border-indigo-500/30"}`}
                          >
                            {getChannelIcon(event.channel)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-[9px] font-black uppercase tracking-[0.15em] ${event.direction === "outbound" ? "text-turquoise-400" : "text-indigo-400"}`}
                              >
                                {event.direction}_{event.channel}
                              </span>
                              <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">
                                {new Date(event.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="p-3.5 rounded-xl border border-border/30 bg-background/50 shadow-inner group-hover/event:border-indigo-500/20 transition-all group-hover/event:bg-background/80">
                              <p className="text-[10px] font-bold leading-relaxed text-muted-foreground line-clamp-3 italic uppercase tracking-tight">
                                {event.content_preview}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </StatusGate>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col gap-8 h-full overflow-hidden relative">
        <Glow
          color="indigo"
          size="600px"
          opacity={0.05}
          position="center"
          className="top-1/4"
        />

        <header className="flex justify-between items-center shrink-0 p-3 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 group hover:scale-105 transition-transform">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic bg-gradient-to-r from-indigo-500 to-turquoise-400 bg-clip-text text-transparent">
                Nyra Assistant
              </h1>
              <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                <span className="flex items-center text-turquoise-400">
                  <div className="size-2 rounded-full bg-turquoise-500 mr-2.5 animate-pulse shadow-[0_0_10px_rgba(20,184,166,1)]" />{" "}
                  CLUSTER_ONLINE
                </span>
                <span className="text-muted-foreground opacity-20">|</span>
                <span
                  className={`flex items-center ${activeWorker.color} bg-background/50 px-2 py-0.5 rounded-full border border-border/50`}
                >
                  <Cpu className="w-3 h-3 mr-2" /> {activeWorker.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        <Card className="flex-1 flex flex-col min-h-0 border border-border/40 shadow-2xl bg-card/10 backdrop-blur-xl overflow-hidden rounded-[32px] relative z-10">
          <CardContent className="flex-1 overflow-hidden p-0 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none" />
            <ScrollArea className="h-full p-10">
              <div className="space-y-10 max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-5`}
                      >
                        <div
                          className={`w-11 h-11 rounded-2xl border shadow-2xl flex items-center justify-center shrink-0 group hover:scale-110 transition-transform ${
                            m.role === "assistant"
                              ? "bg-indigo-600 border-indigo-400/50"
                              : "bg-card/40 border-border/50 backdrop-blur-md"
                          }`}
                        >
                          {m.role === "assistant" ? (
                            <Bot className="h-6 w-6 text-white" />
                          ) : (
                            <User className="h-6 w-6 text-indigo-400" />
                          )}
                        </div>
                        <div
                          className={`space-y-3 ${m.role === "user" ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`p-6 rounded-[24px] shadow-2xl relative group transition-all ${
                              m.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-400/30"
                                : "bg-card/60 text-foreground rounded-tl-none border border-border/40 backdrop-blur-xl hover:bg-card/80"
                            }`}
                          >
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-bold tracking-tight italic uppercase">
                              {m.content}
                            </p>
                          </div>
                          {m.model && (
                            <div className="flex items-center gap-3 px-3">
                              <Badge
                                variant="outline"
                                className="text-[8px] font-black uppercase tracking-[0.25em] py-0.5 border-indigo-500/20 text-indigo-400 bg-indigo-500/5 shadow-inner"
                              >
                                <Sparkles className="w-2.5 h-2.5 mr-2" />{" "}
                                {m.model}
                              </Badge>
                              <span className="text-[8px] font-black text-muted-foreground uppercase opacity-30 tracking-widest">
                                {new Date(m.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <div className="flex justify-start pl-16">
                    <div className="flex items-center space-x-2.5 bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-[20px] rounded-tl-none shadow-inner">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-8 bg-background/40 backdrop-blur-2xl border-t border-border/40 flex flex-col gap-8">
            {/* Quick Action Chips */}
            {selectedLeadId && (
              <div className="flex flex-wrap gap-3 max-w-4xl mx-auto w-full">
                {actionChips.map((chip, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-9 text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all rounded-full px-5 shadow-inner"
                    onClick={chip.action}
                  >
                    {chip.icon} {chip.label}
                  </Button>
                ))}
              </div>
            )}
            <div className="max-w-4xl mx-auto w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative group/form"
              >
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-turquoise-400 rounded-[20px] opacity-10 group-focus-within/form:opacity-30 transition-opacity blur-lg" />
                <div className="relative flex items-center gap-4 bg-background/60 backdrop-blur-md border border-border/50 rounded-2xl p-2.5 pr-4 focus-within:border-indigo-500/50 transition-all shadow-2xl shadow-black/50 group-focus-within/form:ring-4 group-focus-within/form:ring-indigo-500/5">
                  <div className="p-2.5 rounded-xl bg-indigo-600 text-white ml-1 shadow-lg shadow-indigo-500/30 border border-indigo-400/20 transition-transform group-focus-within/form:scale-105">
                    <Zap className="size-4.5 fill-current" />
                  </div>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      selectedLeadId
                        ? `INSTRUCT_NYRA: PROTOCOL_BUFFER_READY...`
                        : "INITIATE_ASSISTANT_UPLINK..."
                    }
                    className="flex-1 border-none focus-visible:ring-0 shadow-none bg-transparent text-sm font-black uppercase tracking-tight placeholder:text-muted-foreground/30 h-12"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isTyping}
                    className="rounded-xl h-12 w-12 bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition-all active:scale-90 shadow-xl shadow-indigo-500/40 border border-indigo-400/30"
                  >
                    <Send className="h-5.5 w-5.5" />
                  </Button>
                </div>
              </form>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
