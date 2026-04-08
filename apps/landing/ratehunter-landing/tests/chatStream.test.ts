import { readChatStream } from '@/utils/chatStream';
import { ReadableStream } from 'stream/web';
import { TextDecoder, TextEncoder } from 'util';

Object.assign(global, { TextDecoder });

function streamFromString(value: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(value));
      controller.close();
    },
  });
}

describe('readChatStream', () => {
  it('parses json payload replies', async () => {
    const response = {
      headers: { get: () => 'application/json' },
      body: null,
      json: async () => ({ reply: 'hello world' }),
    } as unknown as Response;

    await expect(readChatStream(response)).resolves.toBe('hello world');
  });

  it('parses SSE token stream payloads', async () => {
    const response = {
      headers: { get: () => 'text/event-stream' },
      body: streamFromString('data: {"token":"Hello"}\n\ndata: {"token":" world"}\n\ndata: [DONE]\n'),
    } as unknown as Response;

    await expect(readChatStream(response)).resolves.toBe('Hello world');
  });
});
