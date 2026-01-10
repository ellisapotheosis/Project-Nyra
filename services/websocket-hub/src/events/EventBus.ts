import EventEmitter from 'eventemitter3';
import { SystemEvent } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('event-bus');

export class EventBus {
  private emitter = new EventEmitter();

  on(event: string, handler: (data: SystemEvent) => void) {
    this.emitter.on(event, handler);
    logger.debug({ event }, 'Event handler registered');
  }

  off(event: string, handler: (data: SystemEvent) => void) {
    this.emitter.off(event, handler);
    logger.debug({ event }, 'Event handler removed');
  }

  emit(event: string, data: SystemEvent) {
    logger.debug({ event, type: data.type }, 'Event emitted');
    this.emitter.emit(event, data);

    // Also emit to wildcard listeners
    this.emitter.emit('*', data);
  }

  once(event: string, handler: (data: SystemEvent) => void) {
    this.emitter.once(event, handler);
  }

  removeAllListeners(event?: string) {
    this.emitter.removeAllListeners(event);
  }

  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }
}
