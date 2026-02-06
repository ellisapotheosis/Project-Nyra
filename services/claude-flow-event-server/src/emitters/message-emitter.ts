import { EventEmitter } from 'events';
import { MessageEvent, EventType } from '../types/events';

export class MessageEmitter extends EventEmitter {
  constructor(private eventServer: any) {
    super();
  }

  public emitInterAgentMessage(messageData: Omit<MessageEvent, 'type' | 'timestamp'>) {
    const event: MessageEvent = {
      type: EventType.MESSAGE_INTER_AGENT,
      timestamp: Date.now(),
      ...messageData
    };
    this.eventServer.emitEvent(EventType.MESSAGE_INTER_AGENT, event);
  }

  public emitSystemMessage(messageData: Omit<MessageEvent, 'type' | 'timestamp'>) {
    const event: MessageEvent = {
      type: EventType.MESSAGE_SYSTEM,
      timestamp: Date.now(),
      ...messageData
    };
    this.eventServer.emitEvent(EventType.MESSAGE_SYSTEM, event);
  }
}