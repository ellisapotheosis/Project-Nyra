"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  Loader2,
  GripVertical,
  AlertCircle,
  MoreVertical,
  PhoneMissed,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { campaignApi, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { ChannelPreview } from "@/components/campaigns/channel-preview";
import { cn } from "@/lib/utils";

interface CampaignStep {
  id: string;
  day: number;
  channel: "email" | "sms" | "voice" | "missed_call_ping";
  templateId: string;
  offsetMinutes?: number;
}

export default function CampaignBuilder() {
  const params = useParams<{ id: string }>();
  const campaignId = params?.id ?? "new";
  const [name, setName] = useState("Purchase Nurture");
  const [loanPurpose, setLoanPurpose] = useState("PURCHASE");
  const [steps, setSteps] = useState<CampaignStep[]>([]);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchCampaignApi = useApi(campaignApi.getCampaign);
  const saveCampaignApi = useApi(campaignApi.createCampaign);
  const updateCampaignApi = useApi(campaignApi.updateCampaign);
  const deleteCampaignApi = useApi(campaignApi.deleteCampaign);

  const router = useRouter();

  useEffect(() => {
    if (campaignId !== "new") {
      fetchCampaignApi.execute(campaignId).then((data) => {
        setName(data.name);
        setLoanPurpose(data.loanPurpose || "PURCHASE");
        setSteps(data.steps || []);
      });
    } else {
      setName("New Campaign");
      setSteps([
        {
          id: "1",
          day: 0,
          channel: "email",
          templateId: "welcome_quote",
          offsetMinutes: 5,
        },
        { id: "2", day: 1, channel: "sms", templateId: "follow_up_day1" },
      ]);
    }
  }, [campaignId]);

  const addStep = () => {
    const newStep: CampaignStep = {
      id: Date.now().toString(),
      day: steps.length > 0 ? steps[steps.length - 1].day + 1 : 0,
      channel: "email",
      templateId: "",
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<CampaignStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const saveCampaign = async () => {
    try {
      setNotice(null);
      const payload = { name, steps, loanPurpose, active: true };
      if (campaignId === "new") {
        const result = await saveCampaignApi.execute(payload);
        setNotice({
          type: "success",
          message: "Campaign created successfully.",
        });
        router.push(`/campaigns/builder/${result.id}`);
      } else {
        await updateCampaignApi.execute(campaignId, payload);
        setNotice({
          type: "success",
          message: "Campaign updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      setNotice({ type: "error", message: "Error saving campaign." });
    }
  };

  const deleteCampaign = async () => {
    if (
      confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone."
      )
    ) {
      try {
        setNotice(null);
        await deleteCampaignApi.execute(campaignId);
        router.push("/campaigns");
      } catch (error) {
        console.error("Error deleting campaign:", error);
        setNotice({ type: "error", message: "Error deleting campaign." });
      }
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.day - b.day);
  const isOutOfOrder = steps.some(
    (step, index) => index > 0 && step.day < steps[index - 1].day
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-card/40 backdrop-blur-md px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/campaigns">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-border/40 bg-background/50 hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-auto w-auto border-none bg-transparent p-0 text-2xl font-bold tracking-tight shadow-none focus-visible:ring-0"
                />
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                  Draft
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Loan Sequence
                </span>
                <ChevronRight className="size-3 text-muted-foreground/40" />
                <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                  <SelectTrigger className="h-6 w-32 border-none bg-transparent p-0 text-[11px] font-bold uppercase tracking-wider text-turquoise-400 hover:text-turquoise-300 shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40">
                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                    <SelectItem value="REFI_RATE">Refi Rate</SelectItem>
                    <SelectItem value="REFI_CASH">Refi Cash</SelectItem>
                    <SelectItem value="HELOC">HELOC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOutOfOrder && (
              <Badge
                variant="outline"
                className="h-8 border-pink-500/30 bg-pink-500/5 text-pink-400 gap-1.5 px-3"
              >
                <AlertCircle className="size-3.5" /> Out of Order
              </Badge>
            )}
            {notice && (
              <div
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-[11px] font-bold flex items-center gap-2",
                  notice.type === "success"
                    ? "border-turquoise-500/30 bg-turquoise-500/5 text-turquoise-400"
                    : "border-pink-500/30 bg-pink-500/5 text-pink-400"
                )}
              >
                <Info className="size-3.5" />
                {notice.message}
              </div>
            )}
            <div className="h-6 w-px bg-border/40 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/campaigns")}
            >
              Discard
            </Button>
            <Button
              onClick={saveCampaign}
              className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl shadow-[0_0_20px_-5px_rgba(var(--indigo-rgb),0.4)] transition-all active:scale-95 gap-2"
              disabled={
                saveCampaignApi.isLoading || updateCampaignApi.isLoading
              }
            >
              {saveCampaignApi.isLoading || updateCampaignApi.isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span className="text-xs uppercase tracking-widest">
                Deploy Sequence
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Builder Surface */}
      <StatusGate
        data={steps}
        error={fetchCampaignApi.error}
        isLoading={fetchCampaignApi.isLoading}
        onRetry={() => fetchCampaignApi.execute(campaignId)}
        isEmpty={() => false}
      >
        {(currentSteps) => (
          <div className="max-w-4xl mx-auto w-full py-12 px-8 space-y-10 relative">
            {/* Timeline Connector */}
            <div className="absolute left-[51px] top-24 bottom-40 w-0.5 bg-gradient-to-b from-indigo-500/20 via-border/40 to-transparent" />

            {sortedSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-start group">
                {/* Visual Marker */}
                <div className="mr-8 relative z-10 pt-6">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl bg-card border-2 flex items-center justify-center shadow-lg transition-all group-hover:scale-110",
                      index > 0 && step.day < sortedSteps[index - 1].day
                        ? "border-pink-500/40 text-pink-400"
                        : "border-border/60 text-muted-foreground group-hover:border-indigo-500/50 group-hover:text-indigo-400"
                    )}
                  >
                    <span className="text-sm font-black italic">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <Card className="flex-1 border-border/40 bg-card/40 overflow-hidden hover:bg-card/60 transition-colors">
                  <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-6">
                      <GripVertical className="size-4 text-muted-foreground/30 cursor-grab" />
                      <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border/40 bg-background/50">
                        <CalendarDays className="size-3.5 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Execution Day
                        </span>
                        <input
                          type="number"
                          value={step.day}
                          onChange={(e) =>
                            updateStep(step.id, {
                              day: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-8 bg-transparent border-none focus:ring-0 text-sm font-bold p-0 text-foreground"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <ChannelIcon channel={step.channel} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                          {step.channel.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Compliance Badge for each step */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-turquoise-500/20 bg-turquoise-500/5 text-turquoise-400">
                        <ShieldCheck className="size-3" />
                        <span className="text-[9px] font-bold uppercase tracking-tight">
                          Gate Active
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(step.id)}
                        className="size-8 text-muted-foreground/40 hover:text-pink-400 hover:bg-pink-400/5"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            Engagement Channel
                          </label>
                          <Select
                            value={step.channel}
                            onValueChange={(val: any) =>
                              updateStep(step.id, { channel: val })
                            }
                          >
                            <SelectTrigger className="bg-background/40 border-border/60 h-10 font-medium rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border/40">
                              <SelectItem value="email">
                                <div className="flex items-center">
                                  <Mail className="mr-3 size-4 text-pink-400" />{" "}
                                  Email Nurture
                                </div>
                              </SelectItem>
                              <SelectItem value="sms">
                                <div className="flex items-center">
                                  <MessageSquare className="mr-3 size-4 text-indigo-400" />{" "}
                                  SMS / Text
                                </div>
                              </SelectItem>
                              <SelectItem value="voice">
                                <div className="flex items-center">
                                  <Phone className="mr-3 size-4 text-turquoise-400" />{" "}
                                  AI Voice
                                </div>
                              </SelectItem>
                              <SelectItem value="missed_call_ping">
                                <div className="flex items-center">
                                  <PhoneMissed className="mr-3 size-4 text-amber-400" />{" "}
                                  RVM Drop
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            Message Template
                          </label>
                          <Select
                            value={step.templateId}
                            onValueChange={(val: any) =>
                              updateStep(step.id, { templateId: val })
                            }
                          >
                            <SelectTrigger className="bg-background/40 border-border/60 h-10 font-medium rounded-xl">
                              <SelectValue placeholder="Select content..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border/40">
                              <SelectItem value="welcome_quote">
                                Welcome Scenario
                              </SelectItem>
                              <SelectItem value="follow_up_day1">
                                Initial Interest Check
                              </SelectItem>
                              <SelectItem value="rate_alert">
                                Market Pulse Update
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/40 bg-muted/10 p-6 flex flex-col justify-center min-h-[160px] relative group/preview">
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            Live Preview
                          </span>
                          <Zap className="size-2.5 text-amber-400 fill-amber-400" />
                        </div>
                        <ChannelPreview
                          channel={step.channel}
                          templateId={step.templateId}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Add Action */}
            <div className="flex items-start">
              <div className="mr-8 pt-4">
                <div className="h-12 w-12 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center bg-transparent group/add">
                  <Plus className="size-6 text-muted-foreground/40 group-hover/add:text-indigo-400 transition-colors" />
                </div>
              </div>
              <Button
                variant="outline"
                className="flex-1 py-12 border-dashed border-2 bg-card/20 hover:bg-card/40 border-border/40 hover:border-indigo-500/50 transition-all flex flex-col space-y-3 h-auto rounded-[2rem] group"
                onClick={addStep}
              >
                <div className="size-10 rounded-full bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                  <Plus className="size-5 text-indigo-400" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                    Add Sequence Step
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">
                    Expand the automated lead journey
                  </span>
                </div>
              </Button>
            </div>
          </div>
        )}
      </StatusGate>
    </div>
  );
}

function ChannelIcon({ channel }: { channel: string }) {
  switch (channel) {
    case "email":
      return <Mail className="size-3.5 text-pink-400" />;
    case "sms":
      return <MessageSquare className="size-3.5 text-indigo-400" />;
    case "voice":
      return <Phone className="size-3.5 text-turquoise-400" />;
    case "missed_call_ping":
      return <PhoneMissed className="size-3.5 text-amber-400" />;
    default:
      return <Clock className="size-3.5 text-muted-foreground" />;
  }
}
