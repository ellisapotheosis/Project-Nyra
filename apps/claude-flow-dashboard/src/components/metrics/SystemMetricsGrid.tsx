import React from 'react';

interface SystemMetricsGridProps {
  metrics: {
    agents: number;
    tasks: number;
    messages: number;
    memory: number;
  };
}

const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = 'bg-blue-500' }) => (
  <div
    className={`${color} text-white rounded-lg p-4 shadow-md flex justify-between items-center
    transform transition-all duration-300 hover:scale-105`}
  >
    <div>
      <h3 className="text-sm font-semibold opacity-75">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="text-3xl opacity-75">{icon}</div>
  </div>
);

export const SystemMetricsGrid: React.FC<SystemMetricsGridProps> = ({ metrics }) => {
  const metricDetails = [
    {
      label: 'Active Agents',
      value: metrics.agents,
      icon: '🤖',
      color: 'bg-blue-500'
    },
    {
      label: 'Tasks',
      value: metrics.tasks,
      icon: '📋',
      color: 'bg-green-500'
    },
    {
      label: 'Messages',
      value: metrics.messages,
      icon: '💬',
      color: 'bg-purple-500'
    },
    {
      label: 'Memory Entries',
      value: metrics.memory,
      icon: '🧠',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricDetails.map((metric, index) => (
        <MetricCard
          key={index}
          {...metric}
        />
      ))}
    </div>
  );
};