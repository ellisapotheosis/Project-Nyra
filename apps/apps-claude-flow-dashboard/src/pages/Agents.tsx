'use client';

import React from 'react';
import { AgentGrid } from '@/components/agents/AgentGrid';

const AgentsPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-white">Agents</h1>
      <AgentGrid />
    </div>
  );
};

export default AgentsPage;
