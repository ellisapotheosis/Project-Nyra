'use client';

import React from 'react';
import { MemoryLog } from '@/components/metrics/MemoryLog';
import { MemoryMetrics } from '@/components/metrics/MemoryMetrics';

const MemoryPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-white">Memory</h1>
      <MemoryMetrics />
      <MemoryLog />
    </div>
  );
};

export default MemoryPage;
