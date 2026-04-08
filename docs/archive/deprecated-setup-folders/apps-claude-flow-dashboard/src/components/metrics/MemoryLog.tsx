import React from 'react';
import { useMemoryStore } from '../../store/memoryStore';

const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const MemoryLog: React.FC = () => {
  const operations = useMemoryStore((state) => state.operations);

  if (operations.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-slate-400">
        No memory operations yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40">
      <div className="border-b border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">
        Memory Operations ({operations.length})
      </div>
      <div className="max-h-96 overflow-y-auto">
        {operations.slice(0, 100).map((operation) => (
          <div
            key={operation.id}
            className="grid grid-cols-[120px_1fr_auto] gap-3 border-b border-slate-800 px-4 py-2 text-sm last:border-b-0"
          >
            <span className="text-slate-500">{formatTimestamp(operation.timestamp)}</span>
            <span className="truncate text-slate-200">
              <span className="font-medium">{operation.operation}</span>
              <span className="mx-2 text-slate-500">•</span>
              <span>{operation.namespace}:{operation.key}</span>
            </span>
            <span className={operation.status === 'error' ? 'text-red-400' : 'text-emerald-400'}>
              {operation.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
