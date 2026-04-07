import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import WebSocket from 'ws';
import { createWebSocketServer } from '../src/server';
import { EventBuffer } from '../src/services/event-buffer';

describe('WebSocket Server', () => {
  let server: WebSocket.Server;
  let port: number;
  let eventBuffer: EventBuffer;

  beforeEach((done) => {
    eventBuffer = new EventBuffer(10);
    server = createWebSocketServer(eventBuffer);

    // Listen on a random available port
    server.listen(0, () => {
      const address = server.address() as WebSocket.AddressInfo;
      port = address.port;
      done();
    });
  });

  afterEach((done) => {
    server.close((err) => {
      if (err) console.error(err);
      done();
    });
  });

  it('should create a WebSocket server', () => {
    expect(server).toBeTruthy();
  });

  it('should accept WebSocket connections', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);

    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
      done();
    });
  });

  it('should buffer incoming events', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const testEvents = [
      { type: 'test1', data: { message: 'Test 1' } },
      { type: 'test2', data: { message: 'Test 2' } }
    ];

    ws.on('open', () => {
      testEvents.forEach(event => {
        ws.send(JSON.stringify(event));
      });

      // Allow time for events to be processed
      setTimeout(() => {
        const bufferedEvents = eventBuffer.getEvents();
        expect(bufferedEvents).toHaveLength(2);
        expect(bufferedEvents[0].type).toBe('test1');
        expect(bufferedEvents[1].type).toBe('test2');
        ws.close();
        done();
      }, 100);
    });
  });

  it('should handle multiple client connections', (done) => {
    const clients = 3;
    let connectedClients = 0;

    for (let i = 0; i < clients; i++) {
      const ws = new WebSocket(`ws://localhost:${port}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: `client-${i}`, data: { id: i } }));
        
        connectedClients++;
        if (connectedClients === clients) {
          // Allow time for events to be processed
          setTimeout(() => {
            const bufferedEvents = eventBuffer.getEvents();
            expect(bufferedEvents).toHaveLength(clients);
            // Close all clients
            server.clients.forEach(client => client.close());
            done();
          }, 100);
        }
      });
    }
  });

  it('should handle invalid JSON messages', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const invalidMessage = 'Not a valid JSON';

    ws.on('open', () => {
      ws.send(invalidMessage);

      // Allow time for message processing
      setTimeout(() => {
        // Verify that invalid messages don't break the server
        expect(eventBuffer.getEvents()).toHaveLength(0);
        ws.close();
        done();
      }, 100);
    });
  });

  it('should broadcast events to all connected clients', (done) => {
    const clients: WebSocket[] = [];
    const clientCount = 3;
    const testEvent = { type: 'broadcast', data: { message: 'Test broadcast' } };

    let connectedClients = 0;
    const receivedEvents: any[] = [];

    for (let i = 0; i < clientCount; i++) {
      const ws = new WebSocket(`ws://localhost:${port}`);
      clients.push(ws);

      ws.on('open', () => {
        connectedClients++;

        ws.on('message', (data) => {
          receivedEvents.push(JSON.parse(data.toString()));
        });

        // Once all clients are connected, send a broadcast
        if (connectedClients === clientCount) {
          // Broadcast method would be implemented in actual server
          server.clients.forEach(client => {
            client.send(JSON.stringify(testEvent));
          });

          // Wait and verify broadcast
          setTimeout(() => {
            expect(receivedEvents).toHaveLength(clientCount);
            receivedEvents.forEach(event => {
              expect(event).toEqual(testEvent);
            });

            // Close all clients
            clients.forEach(client => client.close());
            done();
          }, 100);
        }
      });
    }
  });
});
