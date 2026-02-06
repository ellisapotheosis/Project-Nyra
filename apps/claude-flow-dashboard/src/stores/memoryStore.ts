import { create } from 'zustand';
import {
  MemoryOperation,
  MemoryOperationType,
  MemoryFilters,
  NamespaceStats,
  DEFAULT_MEMORY_FILTERS
} from '@/types/memory';

interface MemoryStore {
  operations: MemoryOperation[];
  filter: MemoryFilters;
  selectedOperation?: MemoryOperation;
  namespaceStats: Map<string, NamespaceStats>;

  addOperation: (operation: MemoryOperation) => void;
  updateOperation: (id: string, updates: Partial<MemoryOperation>) => void;

  setFilter: (filter: Partial<MemoryFilters>) => void;
  clearFilter: () => void;

  setSelectedOperation: (operation?: MemoryOperation) => void;

  setShowValues: (show: boolean) => void;
  toggleShowValues: () => void;

  clearOperations: () => void;

  registerNamespace: (namespace: string) => void;

  getFilteredOperations: () => MemoryOperation[];
  getOperationById: (id: string) => MemoryOperation | undefined;
  getOperationsByNamespace: (namespace: string) => MemoryOperation[];
  getOperationsByKey: (key: string) => MemoryOperation[];
  getRecentOperations: (limit?: number) => MemoryOperation[];

  getCacheHitRate: () => number;
  getTotalOperations: () => number;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  operations: [],
  filter: DEFAULT_MEMORY_FILTERS,
  selectedOperation: undefined,
  namespaceStats: new Map(),

  addOperation: (operation) => set((state) => {
    const updatedOperations = [...state.operations, operation];
    const updatedNamespaceStats = new Map(state.namespaceStats);

    const namespaceStats = updatedNamespaceStats.get(operation.namespace) || {
      namespace: operation.namespace,
      operationCount: 0,
      storeCount: 0,
      retrieveCount: 0,
      searchCount: 0,
      deleteCount: 0,
      entryCount: 0,
      totalSize: 0,
      avgEntrySize: 0,
      cacheHitRate: 0,
      avgLatency: 0,
      topKeys: [],
    };

    namespaceStats.operationCount++;
    switch (operation.operation) {
      case 'store':
        namespaceStats.storeCount++;
        break;
      case 'retrieve':
        namespaceStats.retrieveCount++;
        break;
      case 'search':
        namespaceStats.searchCount++;
        break;
      case 'delete':
        namespaceStats.deleteCount++;
        break;
    }

    updatedNamespaceStats.set(operation.namespace, namespaceStats);

    return {
      operations: updatedOperations,
      namespaceStats: updatedNamespaceStats
    };
  }),

  updateOperation: (id, updates) => set((state) => ({
    operations: state.operations.map((op) =>
      op.id === id ? { ...op, ...updates } : op
    )
  })),

  setFilter: (filterUpdate) => set((state) => ({
    filter: { ...state.filter, ...filterUpdate }
  })),

  clearFilter: () => set({ filter: DEFAULT_MEMORY_FILTERS }),

  setSelectedOperation: (operation) => set({ selectedOperation: operation }),

  setShowValues: (show) => set((state) => ({
    filter: { ...state.filter, showValues: show }
  })),

  toggleShowValues: () => set((state) => ({
    filter: { ...state.filter, showValues: !state.filter.showValues }
  })),

  clearOperations: () => set({ operations: [] }),

  registerNamespace: (namespace) => set((state) => {
    const updatedNamespaceStats = new Map(state.namespaceStats);
    if (!updatedNamespaceStats.has(namespace)) {
      updatedNamespaceStats.set(namespace, {
        namespace,
        operationCount: 0,
        storeCount: 0,
        retrieveCount: 0,
        searchCount: 0,
        deleteCount: 0,
        entryCount: 0,
        totalSize: 0,
        avgEntrySize: 0,
        cacheHitRate: 0,
        avgLatency: 0,
        topKeys: [],
      });
    }
    return { namespaceStats: updatedNamespaceStats };
  }),

  getFilteredOperations: () => {
    const { operations, filter } = get();
    return operations.filter((op) => {
      const namespaceMatch = filter.namespaces.length === 0 ||
        filter.namespaces.includes(op.namespace);

      const operationMatch = filter.operations.length === 0 ||
        filter.operations.includes(op.operation);

      return namespaceMatch && operationMatch;
    });
  },

  getOperationById: (id) => get().operations.find((op) => op.id === id),

  getOperationsByNamespace: (namespace) =>
    get().operations.filter((op) => op.namespace === namespace),

  getOperationsByKey: (key) =>
    get().operations.filter((op) => op.key === key),

  getRecentOperations: (limit = 10) =>
    get().operations.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit),

  getCacheHitRate: () => {
    const { operations } = get();
    const totalOperations = operations.length;
    const cacheHits = operations.filter((op) => op.cacheHit).length;
    return totalOperations > 0 ? (cacheHits / totalOperations) * 100 : 0;
  },

  getTotalOperations: () => get().operations.length,
}));