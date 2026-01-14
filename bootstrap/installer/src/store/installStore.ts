import { create } from 'zustand';
import {
  PCId,
  ComponentId,
  InstallPhase,
  LogEntry,
  InstallState,
} from '../types/manifest';

interface InstallStore extends InstallState {
  // Actions
  selectPC: (pcId: PCId) => void;
  toggleComponent: (componentId: ComponentId) => void;
  setPhase: (phase: InstallPhase) => void;
  setProgress: (progress: number) => void;
  addLog: (log: Omit<LogEntry, 'timestamp'>) => void;
  addError: (error: Error) => void;
  setInstalling: (isInstalling: boolean) => void;
  reset: () => void;
}

const initialState: InstallState = {
  selectedPC: null,
  enabledComponents: new Set<ComponentId>(),
  currentPhase: 'selection',
  currentStep: 0,
  totalSteps: 0,
  progress: 0,
  logs: [],
  errors: [],
  isInstalling: false,
  canRollback: false,
};

export const useInstallStore = create<InstallStore>((set) => ({
  ...initialState,

  selectPC: (pcId) => set({ selectedPC: pcId }),

  toggleComponent: (componentId) =>
    set((state) => {
      const newComponents = new Set(state.enabledComponents);
      if (newComponents.has(componentId)) {
        newComponents.delete(componentId);
      } else {
        newComponents.add(componentId);
      }
      return { enabledComponents: newComponents };
    }),

  setPhase: (phase) => set({ currentPhase: phase }),

  setProgress: (progress) => set({ progress }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...log,
          timestamp: new Date(),
        },
      ],
    })),

  addError: (error) =>
    set((state) => ({
      errors: [...state.errors, error],
    })),

  setInstalling: (isInstalling) => set({ isInstalling }),

  reset: () => set(initialState),
}));
