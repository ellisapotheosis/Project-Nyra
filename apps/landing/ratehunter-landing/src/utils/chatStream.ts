export async function readChatStream(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  // JSON fallback for non-streaming backends
  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as { reply?: string };
    return payload.reply || '';
  }

  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assistantMessage = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const parsed = JSON.parse(payload) as { token?: string; reply?: string };
        assistantMessage += parsed.token || parsed.reply || '';
      } catch {
        assistantMessage += payload;
      }
    }
  }

  return assistantMessage.trim();
}
