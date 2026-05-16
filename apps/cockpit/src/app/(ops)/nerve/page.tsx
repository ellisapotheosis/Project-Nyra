'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface AgentMessage {
  id: string;
  agent: string;
  content: string;
  timestamp: string;
  type: 'action' | 'event' | 'error';
}

export default function NervePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([
    { id: '1', agent: 'Lead Processor', content: 'Processing lead #12847: John Smith', timestamp: '10:45 AM', type: 'action' },
    { id: '2', agent: 'Compliance Agent', content: 'TILA/RESPA validation passed', timestamp: '10:44 AM', type: 'event' },
    { id: '3', agent: 'Quote Engine', content: 'Generated quote: 6.5% APR', timestamp: '10:43 AM', type: 'action' },
    { id: '4', agent: 'Email Sender', content: 'Verification email sent to borrower', timestamp: '10:42 AM', type: 'event' },
  ]);

  const typeColor = (type: AgentMessage['type']) => {
    switch (type) {
      case 'action':
        return 'bg-cyan-500/20 text-cyan-400 border-l-cyan-400';
      case 'event':
        return 'bg-green-500/20 text-green-400 border-l-green-400';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-l-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400 border-l-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Nerve (Agent Bus)
          </h1>
          <p className="text-gray-400">Real-time agent communication and event streaming</p>
        </div>

        {/* Agent Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {['Lead Processor', 'Compliance', 'Quote Engine', 'Email'].map((agent, i) => (
            <div key={i} className="border border-purple-500/20 bg-black/40 backdrop-blur p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">{agent}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <p className="text-green-400 text-sm font-semibold">Active</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Feed */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Event Stream</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`border-l-4 p-4 rounded ${typeColor(msg.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-white">{msg.agent}</p>
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-gray-300">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Configuration */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Agent Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Message Buffer Size</label>
              <input
                type="number"
                defaultValue={1000}
                className="w-full px-3 py-2 bg-black/60 border border-purple-500/20 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Retention Period (hours)</label>
              <input
                type="number"
                defaultValue={24}
                className="w-full px-3 py-2 bg-black/60 border border-purple-500/20 rounded text-white"
              />
            </div>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-500 hover:to-pink-500 transition">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
