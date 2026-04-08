import { EventEmitter } from 'events';
import { AgentEvent, EventType } from '../types/events';

export class AgentEmitter extends EventEmitter {
  constructor(private eventServer: any) {
    super();
  }

  public emitAgentSpawn(agentData: Omit<AgentEvent, 'type' | 'timestamp'>) {
    const event: AgentEvent = {
      type: EventType.AGENT_SPAWN,
      timestamp: Date.now(),
      ...agentData
    };
    this.eventServer.emitEvent(EventType.AGENT_SPAWN, event);
  }

  public emitAgentStatus(agentData: Omit<AgentEvent, 'type' | 'timestamp'>) {
    const event: AgentEvent = {
      type: EventType.AGENT_STATUS,
      timestamp: Date.now(),
      ...agentData
    };
    this.eventServer.emitEvent(EventType.AGENT_STATUS, event);
  }

  public emitAgentComplete(agentData: Omit<AgentEvent, 'type' | 'timestamp'>) {
    const event: AgentEvent = {
      type: EventType.AGENT_COMPLETE,
      timestamp: Date.now(),
      ...agentData
    };
    this.eventServer.emitEvent(EventType.AGENT_COMPLETE, event);
  }

  public emitAgentError(agentData: Omit<AgentEvent, 'type' | 'timestamp'>) {
    const event: AgentEvent = {
      type: EventType.AGENT_ERROR,
      timestamp: Date.now(),
      ...agentData
    };
    this.eventServer.emitEvent(EventType.AGENT_ERROR, event);
  }
}