import React from 'react';
import { useMemoryStore } from '../../store/memoryStore';

export const MemoryMetrics: React.FC = () => {
  const stats = useMemoryStore((state) => state.stats);

  const success = stats.byStatus.success ?? 0;
  const error = stats.byStatus.error ?? 0;
  const pending = stats.byStatus.pending ?? 0;
  const timeout = stats.byStatus.timeout ?? 0;

  const cards = [
    { label: 'Total', value: stats.totalOperations, tone: 'text-slate-200' },
    { label: 'Success', value: success, tone: 'text-emerald-400' },
    { label: 'Errors', value: error, tone: 'text-red-400' },
    { label: 'Pending', value: pending + timeout, tone: 'text-amber-400' },
  ];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Memory Metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md bg-slate-800/70 p-3">
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className={`mt-1 text-xl font-semibold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
