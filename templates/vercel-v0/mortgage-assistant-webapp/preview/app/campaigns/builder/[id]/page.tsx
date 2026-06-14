"use client";

import React, { use, useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { campaignApi, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
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
      const payload = { name, steps, loanPurpose, active: true };
      if (campaignId === "new") {
        const result = await saveCampaignApi.execute(payload);
        alert("Campaign created successfully!");
        router.push(`/campaigns/builder/${result.id}`);
      } else {
        await updateCampaignApi.execute(campaignId, payload);
        alert("Campaign updated successfully!");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("Error saving campaign.");
    }
  };

  const deleteCampaign = async () => {
    if (
      confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone."
      )
    ) {
      try {
        await deleteCampaignApi.execute(campaignId);
        router.push("/campaigns");
      } catch (error) {
        console.error("Error deleting campaign:", error);
        alert("Error deleting campaign.");
      }
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.day - b.day);
  const isOutOfOrder = steps.some(
    (step, index) => index > 0 && step.day < steps[index - 1].day
  );

  return (
    <div className="flex flex-col space-y-8 p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-6">
          <Link href="/campaigns">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-3xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 h-auto w-auto shadow-none"
              />
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Draft Mode
              </Badge>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Sequence for
              </span>
              <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                <SelectTrigger className="h-7 py-0 px-3 text-xs w-36 border-slate-200 bg-slate-50 hover:bg-slate-100 focus:ring-0 rounded-full transition-colors font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <div className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-bold animate-pulse">
              <AlertCircle className="mr-2 h-4 w-4" /> Out of Order
            </div>
          )}
          <Button
            variant="ghost"
            className="font-bold text-slate-500 hover:bg-slate-100 px-6 rounded-xl h-12"
            onClick={() => router.push("/campaigns")}
          >
            Discard
          </Button>
          {campaignId !== "new" && (
            <Button
              variant="outline"
              className="font-bold text-red-500 border-red-100 hover:bg-red-50 px-6 rounded-xl h-12"
              onClick={deleteCampaign}
              disabled={deleteCampaignApi.isLoading}
            >
              {deleteCampaignApi.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          )}
          <Button
            onClick={saveCampaign}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
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
              <div className="absolute left-[20px] top-10 bottom-24 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-transparent -z-0" />
            )}

            {sortedSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-start group">
                {/* Visual Step Marker */}
                <div className="mr-8 relative z-10 pt-6">
                  <div className="h-10 w-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:border-blue-400 transition-colors">
                    <span className="text-xs font-black text-slate-400 group-hover:text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                </div>

                <Card
                  className={`flex-1 shadow-sm border-slate-200 overflow-hidden transition-all hover:shadow-md ${
                    index > 0 && step.day < sortedSteps[index - 1].day
                      ? "border-l-4 border-l-red-500"
                      : "border-l-4 border-l-blue-600"
                  }`}
                >
                  <div className="flex items-center p-4 border-b border-slate-100 bg-slate-50/30">
                    <GripVertical className="h-4 w-4 text-slate-300 mr-3 cursor-grab" />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Day
                          </span>
                          <input
                            type="number"
                            value={step.day}
                            onChange={(e) =>
                              updateStep(step.id, {
                                day: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-10 bg-transparent border-none focus:ring-0 text-sm font-black p-0 text-blue-600"
                          />
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center space-x-2">
                          <ChannelIcon channel={step.channel} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {step.channel.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-slate-600"
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Channel
                          </label>
                          <Select
                            value={step.channel}
                            onValueChange={(val: any) =>
                              updateStep(step.id, { channel: val })
                            }
                          >
                            <SelectTrigger className="bg-slate-50/50 border-slate-200 h-11 font-semibold rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="email">
                                <div className="flex items-center font-semibold">
                                  <Mail className="mr-3 h-4 w-4 text-red-500" />{" "}
                                  Email Message
                                </div>
                              </SelectItem>
                              <SelectItem value="sms">
                                <div className="flex items-center font-semibold">
                                  <MessageSquare className="mr-3 h-4 w-4 text-blue-500" />{" "}
                                  SMS Text
                                </div>
                              </SelectItem>
                              <SelectItem value="voice">
                                <div className="flex items-center font-semibold">
                                  <Phone className="mr-3 h-4 w-4 text-green-500" />{" "}
                                  Voice Call AI
                                </div>
                              </SelectItem>
                              <SelectItem value="missed_call_ping">
                                <div className="flex items-center font-semibold">
                                  <PhoneMissed className="mr-3 h-4 w-4 text-orange-500" />{" "}
                                  Voicemail Drop
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Content Template
                          </label>
                          <Select
                            value={step.templateId}
                            onValueChange={(val: any) =>
                              updateStep(step.id, { templateId: val })
                            }
                          >
                            <SelectTrigger className="bg-slate-50/50 border-slate-200 h-11 font-semibold rounded-xl">
                              <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="welcome_quote">
                                Welcome Quote
                              </SelectItem>
                              <SelectItem value="follow_up_day1">
                                Day 1 Follow-up
                              </SelectItem>
                              <SelectItem value="rate_alert">
                                Rate Alert
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right: Preview */}
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center min-h-[160px]">
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
                <div className="h-10 w-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                  <Plus className="h-5 w-5 text-slate-300" />
                </div>
              </div>
              <Button
                variant="outline"
                className="flex-1 py-14 border-dashed border-2 bg-white/50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col space-y-3 h-auto rounded-3xl group"
                onClick={addStep}
              >
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Plus className="h-6 w-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-black text-sm uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                    Add Touchpoint
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Extend this lead journey
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
      return <Mail className="h-3 w-3 text-red-500" />;
    case "sms":
      return <MessageSquare className="h-3 w-3 text-blue-500" />;
    case "voice":
      return <Phone className="h-3 w-3 text-green-500" />;
    case "missed_call_ping":
      return <PhoneMissed className="h-3 w-3 text-orange-500" />;
    default:
      return <Clock className="h-3 w-3 text-slate-400" />;
  }
}
