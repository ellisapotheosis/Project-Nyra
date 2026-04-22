'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Sparkles, Zap, Shield, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  model?: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Nyra, your AI Mortgage Assistant. How can I help you with your mortgage journey today?",
      timestamp: new Date(),
      model: 'Hermes 2'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate API call to OpenClaw/Nexus
    try {
      // In a real implementation, this would call:
      // const response = await fetch('/api/assistant/chat', { ... })
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I've received your inquiry about "${input}". Let me analyze your profile and the latest market rates from the Nexus Router.`,
          timestamp: new Date(),
          model: 'Nous Hermes 2 (RTX 3090)'
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100-vh-4rem)] p-4 md:p-8 bg-background max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nyra Assistant</h1>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />
                Orchestrator Online
              </span>
              <span>•</span>
              <span className="flex items-center text-primary font-medium">
                <Cpu className="w-3 h-3 mr-1" />
                Hermes Local Inference
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-muted/50">
            <Shield className="w-3 h-3 mr-1 text-blue-500" />
            TCPA Compliant
          </Badge>
          <Badge variant="outline" className="bg-muted/50">
            <Zap className="w-3 h-3 mr-1 text-yellow-500" />
            Low Latency
          </Badge>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 border-none shadow-2xl bg-muted/30 backdrop-blur-sm overflow-hidden">
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea ref={scrollRef} className="h-full p-6">
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                      <Avatar className={`w-8 h-8 ${m.role === 'user' ? 'ml-3' : 'mr-3'} border`}>
                        <AvatarFallback className={m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                          {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          m.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-card text-card-foreground rounded-tl-none border'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        </div>
                        {m.model && (
                          <p className="text-[10px] text-muted-foreground flex items-center px-1">
                            <Sparkles className="w-2.5 h-2.5 mr-1 text-primary" />
                            {m.model}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-card border p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-6 pt-2 bg-background/50 border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex w-full items-center space-x-2 bg-card border rounded-2xl p-1.5 pr-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nyra about rates, documents, or pre-approval..."
              className="flex-1 border-none focus-visible:ring-0 shadow-none bg-transparent"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="rounded-xl h-10 w-10 shrink-0 transition-transform active:scale-95"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-semibold opacity-50">
        Powered by Project Nyra Neural Control Plane
      </p>
    </div>
  );
}
