'use client';
import { use, useEffect } from 'react';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Save, Mail, MessageSquare, Phone, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { campaignApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';

interface CampaignStep {
  id: string;
  day: number;
  channel: 'email' | 'sms' | 'voice' | 'missed_call_ping';
  templateId: string;
  offsetMinutes?: number;
}

export default function CampaignBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = use(params);
  const [name, setName] = useState('Purchase Nurture');
  const [loanPurpose, setLoanPurpose] = useState('PURCHASE');
  const [steps, setSteps] = useState<CampaignStep[]>([]);

  const fetchCampaignApi = useApi(campaignApi.getCampaign);
  const saveCampaignApi = useApi(campaignApi.createCampaign);
  const updateCampaignApi = useApi(campaignApi.updateCampaign);

  useEffect(() => {
    if (campaignId !== 'new') {
      fetchCampaignApi.execute(campaignId).then((data) => {
        setName(data.name);
        setLoanPurpose(data.loanPurpose || 'PURCHASE');
        setSteps(data.steps || []);
      });
    } else {
      setName('New Campaign');
      setSteps([
        { id: '1', day: 0, channel: 'email', templateId: 'welcome_quote', offsetMinutes: 5 },
        { id: '2', day: 1, channel: 'sms', templateId: 'follow_up_day1' },
      ]);
    }
  }, [campaignId]);

  const addStep = () => {
    const newStep: CampaignStep = {
      id: Date.now().toString(),
      day: steps.length > 0 ? steps[steps.length - 1].day + 1 : 0,
      channel: 'email',
      templateId: '',
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<CampaignStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const saveCampaign = async () => {
    try {
      const payload = { name, steps, loanPurpose, active: true };
      if (campaignId === 'new') {
        await saveCampaignApi.execute(payload);
      } else {
        await updateCampaignApi.execute(campaignId, payload);
      }
      alert('Campaign saved successfully!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign.');
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-8 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 h-auto w-auto"
            />
            <div className="flex items-center space-x-2 mt-1 text-sm">
              <span className="text-muted-foreground">Sequence for</span>
              <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                <SelectTrigger className="h-7 py-0 px-2 text-xs w-32 border-none bg-muted/50 focus:ring-0">
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
        <Button 
          onClick={saveCampaign} 
          className="bg-primary hover:bg-primary/90"
          disabled={saveCampaignApi.isLoading || updateCampaignApi.isLoading}
        >
          {saveCampaignApi.isLoading || updateCampaignApi.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Campaign
        </Button>
      </div>

      <StatusGate
        data={steps}
        error={fetchCampaignApi.error}
        isLoading={fetchCampaignApi.isLoading}
        onRetry={() => fetchCampaignApi.execute(campaignId)}
        isEmpty={() => false} // We want to show the "Add" button even if empty
      >
        {(currentSteps) => (
          <div className="max-w-4xl mx-auto w-full space-y-4">
            {currentSteps.sort((a: any, b: any) => a.day - b.day).map((step: any, index: number) => (
              <div key={step.id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-0 h-4 w-0.5 bg-border" />
                )}
                <Card className="relative z-10 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold flex items-center">
                          <Clock className="mr-1 h-3 w-3" /> Timing
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Day</span>
                          <Input 
                            type="number" 
                            value={step.day} 
                            onChange={(e) => updateStep(step.id, { day: parseInt(e.target.value) })}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold flex items-center">
                          Channel
                        </label>
                        <Select 
                          value={step.channel} 
                          onValueChange={(val: any) => updateStep(step.id, { channel: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> Email</div>
                            </SelectItem>
                            <SelectItem value="sms">
                              <div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> SMS</div>
                            </SelectItem>
                            <SelectItem value="voice">
                              <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /> Voice</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-semibold">Template</label>
                        <Input 
                          placeholder="Template ID" 
                          value={step.templateId}
                          onChange={(e) => updateStep(step.id, { templateId: e.target.value })}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeStep(step.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full py-8 border-dashed flex flex-col space-y-2 h-auto"
              onClick={addStep}
            >
              <Plus className="h-6 w-6" />
              <span>Add New Touchpoint</span>
            </Button>
          </div>
        )}
      </StatusGate>
    </div>
  );
}
