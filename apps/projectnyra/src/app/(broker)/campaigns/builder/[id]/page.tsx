"use client";

import React, { use, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Input } from "@nyra/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nyra/ui";
import { Badge } from "@nyra/ui";
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
  SaveIcon,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { campaignApi, useApi } from "@/lib/api";
import { StatusGate } from "@nyra/ui";
import { ChannelPreview } from "@/components/campaigns/channel-preview";

interface CampaignStep {
  id: string;
  day: number;
  channel: "email" | "sms" | "voice" | "missed_call_ping";
  templateId: string;
  offsetMinutes?: number;
}

export default function CampaignBuilder({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: campaignId } = use(params);
  const [name, setName] = useState("Purchase Nurture");
  const [loanPurpose, setLoanPurpose] = useState("PURCHASE");
  const [steps, setSteps] = useState<CampaignStep[]>([]);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);

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
      setDeleteArmed(false);
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
    if (!deleteArmed) {
      setDeleteArmed(true);
      setNotice({
        type: "error",
        message: "Click delete again to permanently delete this campaign.",
      });
      return;
    }

    try {
      setNotice(null);
      await deleteCampaignApi.execute(campaignId);
      router.push("/campaigns");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      setNotice({ type: "error", message: "Error deleting campaign." });
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.day - b.day);
  const isOutOfOrder = steps.some(
    (step, index) => index > 0 && step.day < steps[index - 1].day
  );

  return (
    <div className="flex flex-col space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end bg-card/40 backdrop-blur-md p-6 rounded-lg shadow-2xl border border-border/50 border-t-2 border-t-primary">
        <div className="flex items-center space-x-6">
          <Link href="/campaigns">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-lg border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-3xl font-black bg-transparent border-none p-0 focus-visible:ring-0 h-auto w-auto shadow-none text-foreground"
              />
              <Badge className="bg-primary/10 text-primary border-primary/20 border font-black text-[10px] uppercase tracking-widest px-3 py-1">
                CAMPAIGN_DRAFT
              </Badge>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                Nurture Logic for
              </span>
              <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                <SelectTrigger className="h-7 py-0 px-3 text-xs w-36 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 focus:ring-0 rounded-full transition-colors font-bold text-emerald-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border/50 font-bold">
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="REFI_RATE">Refi Rate</SelectItem>
                  <SelectItem value="REFI_CASH">Refi Cash</SelectItem>
                  <SelectItem value="HELOC">HELOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isOutOfOrder && (
            <div className="flex items-center px-4 py-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <AlertCircle className="mr-2 h-4 w-4" /> TIMELINE_MISMATCH
            </div>
          )}
          {notice && (
            <div
              className={`rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                notice.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
              role="status"
            >
              {notice.message}
            </div>
          )}
          <Button
            variant="ghost"
            className="font-black text-muted-foreground hover:text-foreground px-6 rounded-lg h-12 uppercase text-[10px] tracking-widest"
            onClick={() => router.push("/campaigns")}
          >
            Discard
          </Button>
          {campaignId !== "new" && (
            <Button
              variant="outline"
              className="font-black text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 px-6 rounded-lg h-12 uppercase text-[10px] tracking-widest"
              onClick={deleteCampaign}
              disabled={deleteCampaignApi.isLoading}
            >
              {deleteCampaignApi.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : deleteArmed ? (
                "Confirm Delete"
              ) : (
                "Delete"
              )}
            </Button>
          )}
          <Button
            onClick={saveCampaign}
            className="bg-primary hover:bg-primary/80 text-white font-black px-8 rounded-lg h-12 shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase text-[10px] tracking-widest"
            disabled={saveCampaignApi.isLoading || updateCampaignApi.isLoading}
          >
            {saveCampaignApi.isLoading || updateCampaignApi.isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save Campaign
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <StatusGate
        data={steps}
        error={fetchCampaignApi.error}
        isLoading={fetchCampaignApi.isLoading}
        onRetry={() => fetchCampaignApi.execute(campaignId)}
        isEmpty={() => false}
      >
        {(currentSteps) => (
          <div className="max-w-4xl mx-auto w-full space-y-6 relative">
            {/* Timeline Connector Line */}
            {sortedSteps.length > 0 && (
              <div className="absolute left-[20px] top-10 bottom-24 w-0.5 bg-gradient-to-b from-primary/40 via-accent/40 to-transparent -z-0" />
            )}

            {sortedSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-start group">
                {/* Visual Step Marker */}
                <div className="mr-8 relative z-10 pt-6">
                  <div className="h-10 w-10 rounded-full bg-background border-2 border-border/50 flex items-center justify-center shadow-xl group-hover:border-primary transition-colors">
                    <span className="text-xs font-black text-muted-foreground group-hover:text-primary">
                      {index + 1}
                    </span>
                  </div>
                </div>

                <Card
                  className={`flex-1 shadow-2xl border-border/50 bg-card/40 backdrop-blur-md overflow-hidden transition-all hover:shadow-primary/5 ${
                    index > 0 && step.day < sortedSteps[index - 1].day
                      ? "border-l-4 border-l-destructive"
                      : "border-l-4 border-l-primary"
                  }`}
                >
                  <div className="flex items-center p-4 border-b border-border/50 bg-background/30">
                    <GripVertical className="h-4 w-4 text-muted-foreground mr-3 cursor-grab opacity-50 hover:opacity-100 transition-opacity" />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50 shadow-inner">
                          <Clock className="h-3 w-3 text-emerald-300" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
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
                            className="w-10 bg-transparent border-none focus:ring-0 text-sm font-black p-0 text-primary"
                          />
                        </div>
                        <div className="h-4 w-px bg-border/50" />
                        <div className="flex items-center space-x-2">
                          <ChannelIcon channel={step.channel} />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {step.channel.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Left: Configuration */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Dispatch Channel
                          </label>
                          <Select
                            value={step.channel}
                            onValueChange={(val: any) =>
                              updateStep(step.id, { channel: val })
                            }
                          >
                            <SelectTrigger className="bg-background/40 border-border/50 h-11 font-bold rounded-lg text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg bg-card border-border/50">
                              <SelectItem value="email">
                                <div className="flex items-center font-bold">
                                  <Mail className="mr-3 h-4 w-4 text-primary" />{" "}
                                  Email Protocol
                                </div>
                              </SelectItem>
                              <SelectItem value="sms">
                                <div className="flex items-center font-bold">
                                  <MessageSquare className="mr-3 h-4 w-4 text-emerald-300" />{" "}
                                  SMS Message
                                </div>
                              </SelectItem>
                              <SelectItem value="voice">
                                <div className="flex items-center font-bold">
                                  <Phone className="mr-3 h-4 w-4 text-accent" />{" "}
                                  Voice Agent AI
                                </div>
                              </SelectItem>
                              <SelectItem value="missed_call_ping">
                                <div className="flex items-center font-bold">
                                  <PhoneMissed className="mr-3 h-4 w-4 text-destructive" />{" "}
                                  Voicemail Drop
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Intelligence Template
                          </label>
                          <Select
                            value={step.templateId}
                            onValueChange={(val: any) =>
                              updateStep(step.id, { templateId: val })
                            }
                          >
                            <SelectTrigger className="bg-background/40 border-border/50 h-11 font-bold rounded-lg text-foreground">
                              <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg bg-card border-border/50 font-bold">
                              <SelectItem value="welcome_quote">
                                welcome_quote.json
                              </SelectItem>
                              <SelectItem value="follow_up_day1">
                                follow_up_day1.json
                              </SelectItem>
                              <SelectItem value="rate_alert">
                                market_rate_alert.json
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right: Preview */}
                      <div className="bg-background/20 rounded-lg p-6 border border-border/30 flex flex-col justify-center min-h-[160px] shadow-inner">
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

            {/* Empty State / Add Button */}
            <div className="flex items-start">
              <div className="mr-8 pt-4">
                <div className="h-10 w-10 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center bg-primary/5">
                  <Plus className="h-5 w-5 text-primary/50" />
                </div>
              </div>
              <Button
                variant="outline"
                className="flex-1 py-14 border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:shadow-2xl transition-all flex flex-col space-y-3 h-auto rounded-lg group shadow-inner"
                onClick={addStep}
              >
                <div className="h-12 w-12 rounded-full bg-background/50 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Plus className="h-6 w-6 text-primary group-hover:text-emerald-300 transition-colors" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-black text-sm uppercase tracking-widest text-primary group-hover:text-primary-foreground transition-colors">
                    Append Lead Journey
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">
                    Add touchpoint to automation stack
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
      return <Mail className="h-4 w-4 text-primary" />;
    case "sms":
      return <MessageSquare className="h-4 w-4 text-emerald-300" />;
    case "voice":
      return <Phone className="h-4 w-4 text-accent" />;
    case "missed_call_ping":
      return <PhoneMissed className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}
