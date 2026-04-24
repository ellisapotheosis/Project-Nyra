'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, Bot, User, Sparkles, Zap, Shield, Cpu, 
  History, Clock, Phone, Mail, MessageSquare, 
  Search, Filter, ChevronRight, AlertCircle,
  Pause, Play, CheckCircle2, FileText, Calendar,
  MoreVertical, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  model?: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  campaignStatus: string;
  loanPurpose: string;
  loanAmount: number;
}

interface TimelineEvent {
  id: string;
  type: string;
  channel: string;
  direction: string;
  description: string;
  sentAt: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Nyra, your AI Mortgage Assistant. Select a lead to begin.",
      timestamp: new Date(),
      model: 'Hermes 2'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // Fetch Leads on Mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        setLeads(data.leads || []);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    };
    fetchLeads();
  }, []);

  // Fetch Timeline when Lead selected
  useEffect(() => {
    if (!selectedLeadId) return;

    const fetchTimeline = async () => {
      setLoadingTimeline(true);
      try {
        const response = await fetch(`/api/leads/${selectedLeadId}/conversation`);
        const data = await response.json();
        setTimeline(data.logs || []);
        
        const lead = leads.find(l => l.id === selectedLeadId);
        if (lead) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Loaded ${lead.firstName}'s file. Status: ${lead.campaignStatus}. They're looking for a ${lead.loanPurpose} loan. What can I do?`,
            timestamp: new Date(),
            model: 'Nous Hermes 2'
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      } finally {
        setLoadingTimeline(false);
      }
    };
    fetchTimeline();
  }, [selectedLeadId]);

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/internal/openclaw/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.assistant || 'Error processing request.',
        timestamp: new Date(),
        model: 'Nous Hermes 2 (RTX 3090)'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Nexus Router offline.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateCampaignStatus = async (status: string) => {
    if (!selectedLeadId) return;
    try {
      const response = await fetch(`/api/leads/${selectedLeadId}/campaign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setLeads(leads.map(l => l.id === selectedLeadId ? { ...l, campaignStatus: status } : l));
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Successfully updated campaign status to ${status}.`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'sms': return <MessageSquare className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'voice': return <Phone className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const actionChips = [
    { label: 'Generate Quote', icon: <FileText className="h-3 w-3 mr-1" />, action: () => handleSend("Generate a quote for this lead.") },
    { label: 'Summarize Comms', icon: <History className="h-3 w-3 mr-1" />, action: () => handleSend("Summarize the communication history.") },
    { label: 'Check Guidelines', icon: <Shield className="h-3 w-3 mr-1" />, action: () => handleSend("Check mortgage guidelines for this loan type.") },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4 h-full">
        {/* Lead Selection */}
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm shrink-0">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center"><Search className="mr-2 h-4 w-4 text-primary" /> Active Leads</span>
              <Button size="icon" variant="ghost" className="h-6 w-6"><UserPlus className="h-3 w-3" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <ScrollArea className="h-32">
              {loadingLeads ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-1">
                  {leads.map(lead => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between group ${
                        selectedLeadId === lead.id ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{lead.firstName} {lead.lastName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{lead.loanPurpose}</p>
                      </div>
                      <ChevronRight className={`h-3 w-3 transition-opacity ${selectedLeadId === lead.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Lead Details & Actions */}
        {selectedLead && (
          <Card className="border-none shadow-md bg-primary/5 border-l-4 border-l-primary shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold">{selectedLead.firstName} {selectedLead.lastName}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedLead.loanPurpose} • ${ (selectedLead.loanAmount/10000).toLocaleString() }</p>
                </div>
                <Badge variant={selectedLead.campaignStatus === 'ACTIVE' ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0">
                  {selectedLead.campaignStatus}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {selectedLead.campaignStatus === 'ACTIVE' ? (
                  <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => updateCampaignStatus('PAUSED')}>
                    <Pause className="h-3 w-3 mr-1" /> Pause Drip
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => updateCampaignStatus('ACTIVE')}>
                    <Play className="h-3 w-3 mr-1" /> Resume Drip
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => updateCampaignStatus('COMPLETE')}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Closed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="flex-1 border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardHeader className="p-4 pb-2 shrink-0">
            <CardTitle className="text-sm font-bold flex items-center">
              <History className="mr-2 h-4 w-4 text-primary" /> Unified Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {!selectedLeadId ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-2 opacity-50 h-full">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs">Select lead for history</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {timeline.length === 0 && !loadingTimeline && <p className="text-center text-[10px] text-muted-foreground italic">No logs.</p>}
                  {timeline.map((event, i) => (
                    <div key={i} className="relative pl-6 pb-4 group">
                      {i !== timeline.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-border" />}
                      <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-primary bg-background flex items-center justify-center z-10">
                        {getChannelIcon(event.channel)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-primary/70">
                          <span>{event.direction} {event.channel}</span>
                          <span className="text-muted-foreground font-normal">{new Date(event.sentAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] leading-snug text-foreground/90 bg-muted/30 p-2 rounded-lg border border-border/30">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-xl"><Bot className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Nyra Assistant</h1>
              <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" /> CRM Connected</span>
                <span>•</span>
                <span className="flex items-center text-primary font-medium"><Cpu className="w-2.5 h-2.5 mr-1" /> Nous Hermes 2 (Worker)</span>
              </div>
            </div>
          </div>
        </header>

        <Card className="flex-1 flex flex-col min-h-0 border-none shadow-2xl bg-muted/30 backdrop-blur-md overflow-hidden">
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                        <Avatar className={`w-8 h-8 ${m.role === 'user' ? 'ml-3' : 'mr-3'} border shadow-sm`}>
                          <AvatarFallback className={m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                            {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card text-card-foreground rounded-tl-none border border-border/50'}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          </div>
                          {m.model && <p className="text-[9px] text-muted-foreground flex items-center px-1 font-semibold uppercase tracking-wider"><Sparkles className="w-2 h-2 mr-1 text-primary" /> {m.model}</p>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && <div className="flex justify-start pl-11"><div className="flex items-center space-x-1 bg-card border p-3 rounded-2xl rounded-tl-none"><div className="w-1 h-1 bg-primary rounded-full animate-bounce" /><div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" /></div></div>}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 bg-background/50 border-t border-border/50 flex flex-col gap-4">
            {/* Quick Action Chips */}
            {selectedLeadId && (
              <div className="flex flex-wrap gap-2">
                {actionChips.map((chip, i) => (
                  <Button key={i} variant="outline" size="sm" className="h-7 text-[10px] bg-card/50 hover:bg-primary/10 transition-colors" onClick={chip.action}>
                    {chip.icon} {chip.label}
                  </Button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full items-center space-x-2 bg-card border border-border/50 rounded-2xl p-1.5 pr-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-lg">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={selectedLeadId ? "Ask Nyra about this lead..." : "Ask Nyra anything..."} className="flex-1 border-none focus-visible:ring-0 shadow-none bg-transparent text-sm" />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="rounded-xl h-9 w-9 shrink-0 transition-transform active:scale-95"><Send className="h-4 w-4" /></Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
