"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@nyra/ui";
import {
  Trash2,
  Edit2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Sparkles,
  Workflow,
  Zap,
  Save,
  Play,
  Settings,
  ChevronRight,
  Layout,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
  Input,
} from "@nyra/ui";
import { PageHeader } from "@nyra/ui";
import { cn } from "@/lib/utils";

interface DripStep {
  id: string;
  type: "email" | "sms" | "delay" | "condition";
  title: string;
  configured: boolean;
  config?: {
    subject?: string;
    delay?: string;
    condition?: string;
    template?: string;
  };
}

interface DripCampaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused";
  enrolledLeads: number;
  complianceStatus: "compliant" | "warning" | "error";
}

export default function DripBuilderPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [campaigns, setCampaigns] = useState<DripCampaign[]>([
    {
      id: "1",
      name: "Mortgage Pre-Qual Drip",
      status: "active",
      enrolledLeads: 847,
      complianceStatus: "compliant",
    },
    {
      id: "2",
      name: "Refinance Nurture",
      status: "draft",
      enrolledLeads: 0,
      complianceStatus: "compliant",
    },
  ]);

  const [activeCampaign, setActiveCampaign] = useState<string | null>("1");
  const [steps, setSteps] = useState<DripStep[]>([
    {
      id: "1",
      type: "email",
      title: "Welcome Email",
      configured: true,
      config: { subject: "Welcome to Our Service" },
    },
    {
      id: "2",
      type: "delay",
      title: "Wait 2 Days",
      configured: true,
      config: { delay: "2d" },
    },
    { id: "3", type: "email", title: "Follow-up Email", configured: false },
  ]);

  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStep, setEditingStep] = useState<DripStep | null>(null);
  const [newStepType, setNewStepType] = useState<
    "email" | "sms" | "delay" | "condition"
  >("email");

  const handleAddStep = () => {
    const newStep: DripStep = {
      id: Date.now().toString(),
      type: newStepType,
      title: `NEW_${newStepType.toUpperCase()}_NODE`,
      configured: false,
    };
    setSteps([...steps, newStep]);
    setNewStepType("email");
    setShowStepForm(false);
    addToast("success", `PROTOCOL: ${newStepType} node appended to workflow.`);
  };

  const handleDeleteStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
    addToast("success", "PROTOCOL: Workflow node purged.");
  };

  const handlePublishCampaign = () => {
    const allConfigured = steps.every((s) => s.configured);
    if (!allConfigured) {
      addToast(
        "error",
        "GATEWAY_ERROR: All nodes must be configured before deployment."
      );
      return;
    }

    setCampaigns(
      campaigns.map((c) =>
        c.id === activeCampaign ? { ...c, status: "active" as const } : c
      )
    );
    addToast("success", "PROTOCOL: Campaign deployed to Activepieces runtime.");
  };

  const getStepIcon = (type: DripStep["type"]) => {
    switch (type) {
      case "email":
        return <Mail size={16} className="text-turquoise-400" />;
      case "sms":
        return <MessageSquare size={16} className="text-indigo-400" />;
      case "delay":
        return <Clock size={16} className="text-pink-400" />;
      case "condition":
        return <GitBranch size={16} className="text-indigo-400" />;
    }
  };

  const currentCampaign = campaigns.find((c) => c.id === activeCampaign);
  const configuredCount = steps.filter((s) => s.configured).length;
  const complianceValid =
    steps.length > 0 && steps.every((s) => s.type !== "email" || s.configured);

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Workflow_Orchestration"
        title="Campaign Drip Builder"
        description="Design high-fidelity automated lead nurture sequences via Activepieces runtime."
        meta={
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1"
            >
              RUNTIME: ACTIVEPIECES
            </Badge>
            <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1 shadow-lg shadow-turquoise-500/20">
              STATUS: {currentCampaign?.status.toUpperCase() || "IDLE"}
            </Badge>
          </div>
        }
        actions={
          <Button
            onClick={handlePublishCampaign}
            disabled={!currentCampaign || currentCampaign.status === "active"}
            className="px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Play className="mr-2 size-4 fill-current" /> DEPLOY_PROTOCOL
          </Button>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Main Builder Canvas */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground italic flex items-center gap-3">
              <Workflow className="size-5 text-indigo-400" />
              WORKFLOW_SCHEMA_LANE
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {configuredCount} / {steps.length} NODES_CONFIGURED
              </span>
              {complianceValid && (
                <Badge className="bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20 text-[9px] font-black uppercase px-2">
                  TILA/RESPA_SECURE
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {steps.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-border/40 rounded-[48px] opacity-20 bg-indigo-500/5">
                <Plus className="size-16 mx-auto mb-6" />
                <p className="font-black uppercase tracking-[0.5em] text-lg">
                  READY_FOR_SEQUENCING
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-[34px] top-10 bottom-10 w-0.5 bg-indigo-500/10" />

                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="relative flex items-center gap-8 group"
                    >
                      <div
                        className={cn(
                          "size-16 rounded-3xl border-2 flex items-center justify-center z-10 shadow-2xl transition-transform group-hover:scale-105",
                          step.configured
                            ? "bg-indigo-600 border-indigo-400/50 text-white shadow-indigo-500/20"
                            : "bg-card border-border/50 text-muted-foreground"
                        )}
                      >
                        {getStepIcon(step.type)}
                      </div>

                      <Card
                        className={cn(
                          "flex-1 bg-card/40 backdrop-blur-md border border-border/50 hover:border-indigo-500/30 transition-all rounded-[24px] shadow-xl overflow-hidden",
                          !step.configured && "border-pink-500/20 bg-pink-500/5"
                        )}
                      >
                        <CardContent className="p-5 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-40">
                                SEQUENCE_INDEX_0{index + 1}
                              </p>
                              {!step.configured && (
                                <Badge className="bg-pink-500/20 text-pink-400 border-none text-[8px] font-black">
                                  REQUIRES_CONFIGURATION
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight mt-1">
                              {step.title}
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                              {step.type}{" "}
                              {step.config?.delay &&
                                ` • DELAY: ${step.config.delay}`}{" "}
                              {step.config?.subject &&
                                ` • SBJ: ${step.config.subject}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl hover:bg-indigo-500/10 text-indigo-400"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl hover:bg-pink-500/10 text-pink-400"
                              onClick={() => handleDeleteStep(step.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <ChevronRight className="size-5 text-muted-foreground opacity-20 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Step Controller */}
          <div className="pt-8 border-t border-border/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">
              APPEND_PROTOCOL_NODE
            </h3>
            {!showStepForm ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["email", "sms", "delay", "condition"] as const).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setNewStepType(type);
                        setShowStepForm(true);
                      }}
                      className="p-5 bg-card/40 border border-border/50 hover:border-indigo-500/30 rounded-2xl transition-all group flex flex-col items-center gap-3 shadow-xl hover:bg-indigo-500/5"
                    >
                      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                        {getStepIcon(type)}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors">
                        {type}
                      </span>
                    </button>
                  )
                )}
              </div>
            ) : (
              <Card className="bg-indigo-600 border border-indigo-400/30 rounded-[32px] overflow-hidden shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-black uppercase tracking-tighter text-white italic">
                      Configure_{newStepType.toUpperCase()}_Node
                    </h4>
                    <Badge className="bg-white/10 text-white border-white/20 font-black text-[9px] uppercase tracking-widest">
                      STEP_INIT
                    </Badge>
                  </div>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-white/60 ml-1">
                        Node_Protocol_Title
                      </Label>
                      <Input
                        placeholder="ENTER_NODE_LABEL..."
                        className="h-12 bg-white/5 border-white/20 text-white rounded-xl font-black uppercase placeholder:text-white/20 focus:border-white/40"
                      />
                    </div>
                    {newStepType === "email" && (
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-white/60 ml-1">
                          Logic_Template_Library
                        </Label>
                        <select className="h-12 w-full bg-white/5 border-white/20 text-white rounded-xl font-black uppercase px-4 outline-none focus:border-white/40 appearance-none">
                          <option className="bg-indigo-900">
                            PRE_QUAL_TEMPLATE_V1
                          </option>
                          <option className="bg-indigo-900">
                            FOLLOW_UP_REFI_OPTIMIZE
                          </option>
                          <option className="bg-indigo-900">
                            RATE_LOCK_SENTINEL_ALERT
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowStepForm(false)}
                      className="h-12 px-8 rounded-xl text-white/60 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[9px]"
                    >
                      CANCEL_DISPATCH
                    </Button>
                    <Button
                      onClick={handleAddStep}
                      className="h-12 px-10 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest text-[9px] shadow-2xl"
                    >
                      APPEND_TO_PROTOCOL <Plus className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar: Templates and Global Logic */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border-b border-border/30 pb-3">
              PROTOCOL_LIBRARY
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  name: "Mortgage Pre-Qual",
                  steps: 5,
                  leads: "1.2k",
                  color: "indigo",
                },
                {
                  name: "Refinance Nurture",
                  steps: 7,
                  leads: "892",
                  color: "turquoise",
                },
                {
                  name: "Purchase Lead",
                  steps: 6,
                  leads: "456",
                  color: "indigo",
                },
                {
                  name: "Rate Lock Follow-up",
                  steps: 4,
                  leads: "234",
                  color: "pink",
                },
              ].map((template, i) => (
                <button
                  key={i}
                  className="w-full text-left p-5 bg-card/40 border border-border/50 hover:border-indigo-500/30 rounded-2xl transition-all group flex items-center justify-between shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Layout className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                        {template.name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                        {template.steps} NODES • {template.leads} RECS
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-card/40 border-indigo-500/30 overflow-hidden shadow-2xl rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/30">
                <Zap className="size-6 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter italic">
                Instant_Uplink
              </h3>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
              All campaign changes are synchronized to the 4-PC GPU cluster in
              real-time. Activepieces handles the execution layer while Nyra
              orchestrates intent.
            </p>
            <div className="pt-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                <span>RUNTIME_HEALTH</span>
                <span>99.9%</span>
              </div>
              <div className="h-1 w-full bg-indigo-500/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]"
                  style={{ width: "99.9%" }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: any) {
  return (
    <span className={cn("text-xs font-medium text-foreground", className)}>
      {children}
    </span>
  );
}
