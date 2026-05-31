import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { EmailTemplate, DeviceType } from '@/types/template';

interface EditorState {
  // Current template being edited
  currentTemplate: EmailTemplate | null;

  // Editor states
  isPreviewMode: boolean;
  selectedDevice: DeviceType;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;

  // Editor instance (for GrapeJS)
  editorInstance: any | null;

  // Actions
  setCurrentTemplate: (template: EmailTemplate | null) => void;
  updateTemplateHtml: (html: string) => void;
  updateTemplateSubject: (subject: string) => void;
  updateTemplateName: (name: string) => void;
  extractVariables: (html: string) => string[];

  // Preview actions
  togglePreviewMode: () => void;
  setPreviewMode: (mode: boolean) => void;
  setSelectedDevice: (device: DeviceType) => void;

  // Editor actions
  setEditorInstance: (editor: any) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  currentTemplate: null,
  isPreviewMode: false,
  selectedDevice: 'desktop' as DeviceType,
  isDirty: false,
  isSaving: false,
  isLoading: false,
  editorInstance: null,
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentTemplate: (template) =>
        set({ currentTemplate: template, isDirty: false }),

      updateTemplateHtml: (html) => {
        const current = get().currentTemplate;
        if (current) {
          const variables = get().extractVariables(html);
          set({
            currentTemplate: {
              ...current,
              html,
              variables,
              updatedAt: new Date(),
            },
            isDirty: true,
          });
        }
      },

      updateTemplateSubject: (subject) => {
        const current = get().currentTemplate;
        if (current) {
          set({
            currentTemplate: {
              ...current,
              subject,
              updatedAt: new Date(),
            },
            isDirty: true,
          });
        }
      },

      updateTemplateName: (name) => {
        const current = get().currentTemplate;
        if (current) {
          set({
            currentTemplate: {
              ...current,
              name,
              updatedAt: new Date(),
            },
            isDirty: true,
          });
        }
      },

      extractVariables: (html: string): string[] => {
        // Extract {{variable}} patterns from HTML
        const regex = /\{\{(\w+)\}\}/g;
        const matches = html.matchAll(regex);
        const variables = new Set<string>();

        for (const match of matches) {
          variables.add(match[1]);
        }

        return Array.from(variables);
      },

      togglePreviewMode: () =>
        set((state) => ({ isPreviewMode: !state.isPreviewMode })),

      setPreviewMode: (mode) =>
        set({ isPreviewMode: mode }),

      setSelectedDevice: (device) =>
        set({ selectedDevice: device }),

      setEditorInstance: (editor) =>
        set({ editorInstance: editor }),

      setDirty: (dirty) =>
        set({ isDirty: dirty }),

      setSaving: (saving) =>
        set({ isSaving: saving }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      reset: () =>
        set(initialState),
    }),
    { name: 'EditorStore' }
  )
);
