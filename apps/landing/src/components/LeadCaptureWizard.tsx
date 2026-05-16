'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ArrowRight, ArrowLeft, CheckCircle2,
  DollarSign, Percent, User, Phone, Mail,
  MapPin, Landmark, ShieldCheck, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Step = 'PURPOSE' | 'PROPERTY' | 'LOAN' | 'CONTACT' | 'CONSENT' | 'SUCCESS';

interface LeadData {
  loanPurpose: string;
  propertyType: string;
  occupancy: string;
  propertyValue: number;
  downPayment: number;
  creditScore: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function LeadCaptureWizard() {
  const [step, setStep] = useState<Step>('PURPOSE');
  const [data, setData] = useState<LeadData>({
    loanPurpose: 'PURCHASE',
    propertyType: 'SINGLE_FAMILY',
    occupancy: 'PRIMARY',
    propertyValue: 450000,
    downPayment: 90000,
    creditScore: 'EXCELLENT',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const steps: Step[] = ['PURPOSE', 'PROPERTY', 'LOAN', 'CONTACT', 'CONSENT', 'SUCCESS'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / (steps.length - 1)) * 100;

  const updateData = (fields: Partial<LeadData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const next = () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const back = () => {
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        loanPurpose: data.loanPurpose,
        loanAmount: data.propertyValue - data.downPayment,
        propertyValue: data.propertyValue,
        downPayment: data.downPayment,
        creditScore: data.creditScore,
        propertyType: data.propertyType,
        occupancy: data.occupancy,
        source: 'RATEHUNTER_LANDING_WIZARD',
        consentTimestamp: new Date().toISOString()
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_LEAD_CAPTURE_API_URL || 'http://localhost:3300'}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStep('SUCCESS');
      } else {
        alert('GATEWAY_ERROR: Trace uplink failed. Retry later.');
      }
    } catch (error) {
      console.error('Lead submission failed:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'PURPOSE':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Protocol_Goal</h2>
            <RadioGroup
              value={data.loanPurpose}
              onValueChange={(v: string) => updateData({ loanPurpose: v })}
              className="grid grid-cols-1 gap-4"
            >
              {[
                { id: 'PURCHASE', label: 'Buy_Asset', icon: <Home className="h-5 w-5" /> },
                { id: 'REFINANCE', label: 'Optimize_Yield', icon: <Landmark className="h-5 w-5" /> },
                { id: 'CASH_OUT', label: 'Extract_Equity', icon: <DollarSign className="h-5 w-5" /> },
              ].map((opt) => (
                <Label
                  key={opt.id}
                  className={`flex items-center space-x-5 p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-xl ${
                    data.loanPurpose === opt.id ? 'border-indigo-500 bg-indigo-500/10 shadow-indigo-500/20' : 'border-border/50 hover:border-indigo-500/30'
                  }`}
                >
                  <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                  <div className={`p-3 rounded-xl shadow-inner transition-colors ${data.loanPurpose === opt.id ? 'bg-indigo-600 text-white' : 'bg-background/40 text-indigo-400 border border-indigo-500/20'}`}>
                    {opt.icon}
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs group-hover:text-indigo-400 transition-colors">{opt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 'PROPERTY':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Subject_Property</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Asset_Class</Label>
                <RadioGroup
                  value={data.propertyType}
                  onValueChange={(v: string) => updateData({ propertyType: v })}
                  className="grid grid-cols-2 gap-3"
                >
                  {['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY'].map(v => (
                    <Label key={v} className="flex items-center space-x-3 p-4 rounded-xl border border-border/50 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 shadow-inner bg-background/20 transition-all">
                      <RadioGroupItem value={v} id={v} className="text-indigo-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{v.replace('_', ' ')}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Occupancy_Status</Label>
                <RadioGroup
                  value={data.occupancy}
                  onValueChange={(v: string) => updateData({ occupancy: v })}
                  className="grid grid-cols-3 gap-3"
                >
                  {['PRIMARY', 'SECONDARY', 'INVESTMENT'].map(v => (
                    <Label key={v} className="flex items-center space-x-2 p-3 rounded-xl border border-border/50 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 shadow-inner bg-background/20 transition-all">
                      <RadioGroupItem value={v} id={v} className="text-turquoise-600" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{v}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 'LOAN':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Scenario_Metrics</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Est_Market_Value</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-turquoise-400" />
                  <Input
                    type="number"
                    value={data.propertyValue}
                    onChange={(e) => updateData({ propertyValue: parseInt(e.target.value) })}
                    className="h-14 pl-12 bg-background/40 border-border/50 rounded-2xl text-xl font-black text-foreground focus:border-indigo-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Down_Liquidity</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <Input
                    type="number"
                    value={data.downPayment}
                    onChange={(e) => updateData({ downPayment: parseInt(e.target.value) })}
                    className="h-14 pl-12 bg-background/40 border-border/50 rounded-2xl text-xl font-black text-foreground focus:border-indigo-500/50 transition-all shadow-inner"
                  />
                </div>
                <div className="flex justify-between px-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">LTV_ESTIMATE: { (100 - (data.downPayment / data.propertyValue * 100)).toFixed(1) }%</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-turquoise-400">{((data.downPayment / data.propertyValue) * 100).toFixed(1)}%_DOWN</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">FICO_Cognitive_Index</Label>
                <RadioGroup
                  value={data.creditScore}
                  onValueChange={(v: string) => updateData({ creditScore: v })}
                  className="grid grid-cols-2 gap-3"
                >
                  {['EXCELLENT (740+)', 'GOOD (700-739)', 'FAIR (640-699)', 'POOR (<640)'].map(v => (
                    <Label key={v} className="flex items-center space-x-3 p-4 rounded-xl border border-border/50 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 shadow-inner bg-background/20 transition-all">
                      <RadioGroupItem value={v.split(' ')[0]} id={v} className="text-pink-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{v}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 'CONTACT':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Registry_Ingress</h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">First_Name</Label>
                <Input className="h-12 bg-background/40 border-border/50 rounded-xl font-bold shadow-inner" value={data.firstName} onChange={(e) => updateData({ firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Last_Name</Label>
                <Input className="h-12 bg-background/40 border-border/50 rounded-xl font-bold shadow-inner" value={data.lastName} onChange={(e) => updateData({ lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure_Email</Label>
              <Input className="h-12 bg-background/40 border-border/50 rounded-xl font-bold shadow-inner" type="email" value={data.email} onChange={(e) => updateData({ email: e.target.value })} placeholder="hub_access@client.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Cellular_Node</Label>
              <Input className="h-12 bg-background/40 border-border/50 rounded-xl font-bold shadow-inner" type="tel" value={data.phone} onChange={(e) => updateData({ phone: e.target.value })} placeholder="(949) 000-0000" />
            </div>
          </div>
        );

      case 'CONSENT':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/20 space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />
              <div className="flex items-center gap-5">
                 <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl border border-indigo-400/30">
                    <ShieldCheck className="h-8 w-8 text-white" />
                 </div>
                 <h2 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none italic">Protocol_Acknowledge</h2>
              </div>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed uppercase tracking-tight opacity-70">
                By clicking "GET_CUSTOM_ANALYSIS", you authorize RateHunter and its partners to contact you at the cellular node provided using automated technology (SMS, email, or voice) regarding mortgage products. Consent is not a condition of purchase.
              </p>
              <div className="space-y-3 pt-6 border-t border-indigo-500/20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">CALCULATED_SCENARIO_TRACE:</p>
                <div className="p-5 rounded-2xl bg-background/60 border border-border/30 shadow-inner">
                   <p className="text-sm font-black text-foreground uppercase tracking-tight">
                    ${(data.propertyValue - data.downPayment).toLocaleString()} {data.loanPurpose.toLowerCase()} LOAN
                   </p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">FOR_A_{data.occupancy.toLowerCase()}_RESIDENCE</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="py-20 text-center space-y-10 animate-in zoom-in-95 duration-700">
            <div className="flex justify-center relative">
               <div className="absolute inset-0 bg-turquoise-500/20 blur-3xl rounded-full" />
              <div className="h-24 w-24 rounded-3xl bg-turquoise-500 text-black flex items-center justify-center shadow-2xl relative z-10 border border-turquoise-400/40 animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>
            <div>
               <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">SYNCHRONIZED!</h2>
               <p className="text-muted-foreground text-sm font-black uppercase tracking-widest mt-4 max-w-sm mx-auto leading-relaxed">
                RateHunter is processing your cognitive scenario. Expect a personalized analysis from Ellis Andersen via Gmail shortly.
              </p>
            </div>
            <div className="pt-6">
               <Button variant="outline" onClick={() => window.location.reload()} className="h-12 px-10 rounded-full border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                 NEW_PROTOCOL_RUN
               </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)] border border-border/40 bg-card/20 backdrop-blur-2xl overflow-hidden rounded-[48px] border-t-2 border-t-indigo-500 animate-in fade-in duration-500">
      {step !== 'SUCCESS' && (
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg border border-indigo-400/30">
                 <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Qualification_Engine</span>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 leading-none mt-1">Ellis Andersen v1.0</p>
              </div>
            </div>
            <Badge variant="outline" className="h-7 px-3 rounded-full border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[9px] font-black uppercase tracking-widest">Step {currentStepIndex + 1}_OF_5</Badge>
          </div>
          <div className="h-1.5 w-full bg-indigo-500/10 rounded-full border border-indigo-500/5 overflow-hidden shadow-inner">
             <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className="h-full bg-gradient-to-r from-indigo-500 to-turquoise-400 shadow-[0_0_12px_rgba(20,184,166,0.6)]"
             />
          </div>
        </CardHeader>
      )}
      <CardContent className="p-8 pt-6 min-h-[460px] flex flex-col">
        {renderStep()}
      </CardContent>
      {step !== 'SUCCESS' && (
        <CardFooter className="flex justify-between bg-indigo-500/5 border-t border-border/30 p-8">
          <Button variant="ghost" onClick={back} disabled={currentStepIndex === 0} className="h-12 px-6 rounded-2xl text-muted-foreground hover:text-indigo-400 transition-colors font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="h-4 w-4 mr-2" /> PREV_STEP
          </Button>
          {step === 'CONSENT' ? (
            <Button onClick={handleSubmit} className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all">
              GET_CUSTOM_ANALYSIS <Sparkles className="h-4 w-4 ml-3" />
            </Button>
          ) : (
            <Button onClick={next} className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all">
              NEXT_PHASE <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
