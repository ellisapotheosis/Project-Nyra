'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, AlertCircle } from 'lucide-react';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

export default function OpenClawToolsPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) {
      return;
    }

    const nextMessages = [...messages, { content: trimmedInput, role: 'user' as const }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/internal/openclaw/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as { assistant?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'OpenClaw proxy request failed');
      }

      setMessages((previous) => [
        ...previous,
        { content: data.assistant || 'No assistant response body returned.', role: 'assistant' },
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-8 max-w-4xl mx-auto min-h-screen">
      <div>
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">
          Internal Proxy
        </p>
        <h1 className="text-3xl font-bold tracking-tight">/tools/openclaw</h1>
        <p className="text-muted-foreground mt-2">
          Thin internal chat panel using the server-side proxy route at <code>/api/internal/openclaw/chat</code>.
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-[400px] border shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[400px] p-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 opacity-50 space-y-2">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm">No messages yet. Ask Nyra something.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div className={`p-2 rounded-full border shadow-sm ${message.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                      {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                      message.role === 'assistant'
                        ? 'bg-card border rounded-tl-none'
                        : 'bg-primary text-primary-foreground rounded-tr-none'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-center space-x-2 pl-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 bg-background/50 border-t flex flex-col gap-4">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask OpenClaw..."
              className="flex-1 shadow-none"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="ml-2">Send</span>
            </Button>
          </form>
          {error && (
            <div className="flex items-center space-x-2 text-destructive text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {error}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
