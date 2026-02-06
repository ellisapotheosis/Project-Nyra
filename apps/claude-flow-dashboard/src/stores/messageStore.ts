import { create } from 'zustand';
import { MessageStore } from '@/types/domain/StoreTypes';
import { MessageType } from '@/types/domain/StoreTypes';

const MAX_MESSAGES = 1000;

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (message: MessageType) => set((state) => ({
    messages: [
      message,
      ...state.messages.slice(0, MAX_MESSAGES - 1)
    ]
  }))
}));