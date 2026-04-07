'use client';

import React from 'react';
import { SystemTopology } from '@/components/topology/SystemTopology';

const TopologyPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-white">Topology</h1>
      <SystemTopology />
    </div>
  );
};

export default TopologyPage;
