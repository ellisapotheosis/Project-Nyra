function extractMessageChunk(payload: Record<string, unknown>): string {
  if (typeof payload.token === "string") return payload.token;
  if (typeof payload.reply === "string") return payload.reply;
  if (typeof payload.content === "string") return payload.content;

  const delta = payload.delta;
  if (typeof delta === "string") return delta;
  if (
    delta &&
    typeof delta === "object" &&
    typeof (delta as { content?: unknown }).content === "string"
  ) {
    return (delta as { content: string }).content;
  }

  const choices = payload.choices;
  if (Array.isArray(choices)) {
    return choices
      .map((choice) => {
        if (!choice || typeof choice !== "object") return "";
        const typedChoice = choice as {
          delta?: { content?: unknown };
          message?: { content?: unknown };
          text?: unknown;
        };

        if (typeof typedChoice.delta?.content === "string")
          return typedChoice.delta.content;
        if (typeof typedChoice.message?.content === "string")
          return typedChoice.message.content;
        if (typeof typedChoice.text === "string") return typedChoice.text;
        return "";
      })
      .join("");
  }

  return "";
}

export async function readChatStream(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  // JSON fallback for non-streaming backends
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { reply?: string };
    return payload.reply || "";
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assistantMessage = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload) as Record<string, unknown>;
        assistantMessage += extractMessageChunk(parsed) || "";
      } catch {
        assistantMessage += payload;
      }
    }
  }

  return assistantMessage.trim();
}
