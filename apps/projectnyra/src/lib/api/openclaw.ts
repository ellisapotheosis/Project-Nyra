import { createClient } from "./base";

export type OpenClawChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export type OpenClawChatResponse = {
  assistant?: string;
  error?: string;
};

const client = createClient({ baseUrl: "" });

export const openClawApi = {
  chat: (messages: OpenClawChatMessage[]) =>
    client.post<OpenClawChatResponse>("/api/internal/openclaw/chat", {
      messages,
    }),
};
