import { describe, it, expect, beforeEach } from 'vitest';
import { EventBuffer } from '../src/services/event-buffer';
import { WebSocketEvent } from '../src/types';

describe('EventBuffer', () => {
  let eventBuffer: EventBuffer;

  beforeEach(() => {
    eventBuffer = new EventBuffer(10); // Buffer size of 10
  });

  it('should add events to the buffer', () => {
    const event: WebSocketEvent = {
      type: 'test',
      timestamp: Date.now(),
      data: { message: 'Test event' }
    };

    eventBuffer.add(event);

    expect(eventBuffer.getEvents()).toHaveLength(1);
    expect(eventBuffer.getEvents()[0]).toEqual(event);
  });

  it('should limit buffer size', () => {
    for (let i = 0; i < 15; i++) {
      eventBuffer.add({
        type: `test-${i}`,
        timestamp: Date.now(),
        data: { message: `Test event ${i}` }
      });
    }

    const events = eventBuffer.getEvents();
    expect(events).toHaveLength(10);
    expect(events[0].type).toBe('test-5'); // First event after buffer limit
  });

  it('should clear the buffer', () => {
    const event: WebSocketEvent = {
      type: 'test',
      timestamp: Date.now(),
      data: { message: 'Test event' }
    };

    eventBuffer.add(event);
    eventBuffer.clear();

    expect(eventBuffer.getEvents()).toHaveLength(0);
  });

  it('should get latest events', () => {
    for (let i = 0; i < 5; i++) {
      eventBuffer.add({
        type: `test-${i}`,
        timestamp: Date.now(),
        data: { message: `Test event ${i}` }
      });
    }

    const latestEvents = eventBuffer.getLatestEvents(2);
    expect(latestEvents).toHaveLength(2);
    expect(latestEvents[0].type).toBe('test-4');
    expect(latestEvents[1].type).toBe('test-3');
  });

  it('should handle event with different types', () => {
    const events = [
      { type: 'agent_spawn', timestamp: Date.now(), data: { agentId: '1' } },
      { type: 'task_complete', timestamp: Date.now(), data: { taskId: '2' } },
      { type: 'error', timestamp: Date.now(), data: { message: 'Test error' } }
    ];

    events.forEach(event => eventBuffer.add(event));

    const bufferEvents = eventBuffer.getEvents();
    expect(bufferEvents).toHaveLength(3);
    expect(bufferEvents.map(e => e.type)).toEqual(['agent_spawn', 'task_complete', 'error']);
  });
});
