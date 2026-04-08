import { EventEmitter } from 'events';
import { MemoryEvent, EventType } from '../types/events';

export class MemoryEmitter extends EventEmitter {
  constructor(private eventServer: any) {
    super();
  }

  public emitMemoryRead(memoryData: Omit<MemoryEvent, 'type' | 'timestamp' | 'operation'>) {
    const event: MemoryEvent = {
      type: EventType.MEMORY_READ,
      timestamp: Date.now(),
      operation: 'read',
      ...memoryData
    };
    this.eventServer.emitEvent(EventType.MEMORY_READ, event);
  }

  public emitMemoryWrite(memoryData: Omit<MemoryEvent, 'type' | 'timestamp' | 'operation'>) {
    const event: MemoryEvent = {
      type: EventType.MEMORY_WRITE,
      timestamp: Date.now(),
      operation: 'write',
      ...memoryData
    };
    this.eventServer.emitEvent(EventType.MEMORY_WRITE, event);
  }

  public emitMemoryEviction(memoryData: Omit<MemoryEvent, 'type' | 'timestamp' | 'operation'>) {
    const event: MemoryEvent = {
      type: EventType.MEMORY_EVICTION,
      timestamp: Date.now(),
      operation: 'evict',
      ...memoryData
    };
    this.eventServer.emitEvent(EventType.MEMORY_EVICTION, event);
  }
}