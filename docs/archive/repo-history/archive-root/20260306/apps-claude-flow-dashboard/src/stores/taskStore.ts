import { create } from 'zustand';
import { TaskStore } from '@/types/domain/StoreTypes';
import { TaskStatus } from '@/types/domain/StoreTypes';

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  addTask: (task: TaskStatus) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  updateTask: (id: string, updates: Partial<TaskStatus>) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    )
  })),
  removeTask: (id: string) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id)
  }))
}));