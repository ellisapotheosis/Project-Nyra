'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ArrowRight, ArrowLeft, CheckCircle2, 
  DollarSign, Percent, User, Phone, Mail, 
  MapPin, Landmark, ShieldCheck, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        source: 'RATEHUNTER_LANDING',
        consentTimestamp: new Date().toISOString()
      };

      // Send to n8n WF_LEAD_INGEST Webhook (via Next.js Proxy)
      const response = await fetch('/api/leads/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setStep('SUCCESS');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Lead submission failed:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'PURPOSE':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold">What are you looking to do?</h2>
            <RadioGroup 
              value={data.loanPurpose} 
              onValueChange={(v) => updateData({ loanPurpose: v })}
              className="grid grid-cols-1 gap-3"
            >
              {[
                { id: 'PURCHASE', label: 'Buy a Home', icon: <Home className="h-5 w-5" /> },
                { id: 'REFINANCE', label: 'Refinance', icon: <Landmark className="h-5 w-5" /> },
                { id: 'CASH_OUT', label: 'Cash-Out Refinance', icon: <DollarSign className="h-5 w-5" /> },
              ].map((opt) => (
                <Label
                  key={opt.id}
                  className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    data.loanPurpose === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                  <div className={`p-2 rounded-lg ${data.loanPurpose === opt.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                    {opt.icon}
                  </div>
                  <span className="font-semibold">{opt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 'PROPERTY':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold">Property Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Property Type</Label>
                <RadioGroup 
                  value={data.propertyType} 
                  onValueChange={(v) => updateData({ propertyType: v })}
                  className="grid grid-cols-2 gap-2"
                >
                  {['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY'].map(v => (
                    <Label key={v} className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value={v} id={v} />
                      <span className="text-xs font-medium uppercase">{v.replace('_', ' ')}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Occupancy</Label>
                <RadioGroup 
                  value={data.occupancy} 
                  onValueChange={(v) => updateData({ occupancy: v })}
                  className="grid grid-cols-3 gap-2"
                >
                  {['PRIMARY', 'SECONDARY', 'INVESTMENT'].map(v => (
                    <Label key={v} className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value={v} id={v} />
                      <span className="text-[10px] font-bold uppercase">{v}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 'LOAN':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold">Estimated Numbers</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estimated Property Value</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={data.propertyValue} 
                    onChange={(e) => updateData({ propertyValue: parseInt(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Down Payment Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={data.downPayment} 
                    onChange={(e) => updateData({ downPayment: parseInt(e.target.value) })}
                    className="pl-9"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Approx. {((data.downPayment / data.propertyValue) * 100).toFixed(1)}% down</p>
              </div>
              <div className="space-y-2">
                <Label>Estimated Credit Score</Label>
                <RadioGroup 
                  value={data.creditScore} 
                  onValueChange={(v) => updateData({ creditScore: v })}
                  className="grid grid-cols-2 gap-2"
                >
                  {['EXCELLENT (740+)', 'GOOD (700-739)', 'FAIR (640-699)', 'POOR (<640)'].map(v => (
                    <Label key={v} className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value={v.split(' ')[0]} id={v} />
                      <span className="text-[10px] font-bold uppercase">{v}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 'CONTACT':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold">Where should we send your results?</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={data.firstName} onChange={(e) => updateData({ firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={data.lastName} onChange={(e) => updateData({ lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={data.email} onChange={(e) => updateData({ email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input type="tel" value={data.phone} onChange={(e) => updateData({ phone: e.target.value })} placeholder="(555) 000-0000" />
            </div>
          </div>
        );

      case 'CONSENT':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold">Final Verification</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By clicking "Get My Quote", you authorize RateHunter and its partners to contact you at the number/email provided using automated technology (SMS, email, or voice) regarding mortgage products. Consent is not a condition of purchase.
              </p>
              <div className="space-y-2 pt-2 border-t border-primary/10">
                <p className="text-[10px] font-bold uppercase text-primary">Your Estimated Scenario:</p>
                <p className="text-sm font-semibold">${(data.propertyValue - data.downPayment).toLocaleString()} {data.loanPurpose.toLowerCase()} loan for a {data.occupancy.toLowerCase()} residence.</p>
              </div>
            </div>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Quote Requested!</h2>
            <p className="text-muted-foreground text-sm">
              Nyra is analyzing your scenario and the current rate sheets. 
              Expect an email with your professional quote in the next 2 minutes.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Start New Request
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl border-none bg-card/80 backdrop-blur-md overflow-hidden">
      {step !== 'SUCCESS' && (
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary/10 rounded-lg"><Sparkles className="h-4 w-4 text-primary" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">RateHunter Wizard</span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">Step {currentStepIndex + 1} of 5</span>
          </div>
          <Progress value={progress} className="h-1" />
        </CardHeader>
      )}
      <CardContent className="pt-4">
        {renderStep()}
      </CardContent>
      {step !== 'SUCCESS' && (
        <CardFooter className="flex justify-between bg-muted/30 border-t p-4">
          <Button variant="ghost" onClick={back} disabled={currentStepIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {step === 'CONSENT' ? (
            <Button onClick={handleSubmit} className="px-8 shadow-lg shadow-primary/20">
              Get My Quote <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={next} className="px-8">
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
