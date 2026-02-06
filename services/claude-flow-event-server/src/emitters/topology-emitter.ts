import { EventEmitter } from 'events';
import { TopologyEvent, EventType } from '../types/events';

export class TopologyEmitter extends EventEmitter {
  constructor(private eventServer: any) {
    super();
  }

  public emitNodeAdd(topologyData: Omit<TopologyEvent, 'type' | 'timestamp' | 'action'>) {
    const event: TopologyEvent = {
      type: EventType.TOPOLOGY_NODE_ADD,
      timestamp: Date.now(),
      action: 'add',
      ...topologyData
    };
    this.eventServer.emitEvent(EventType.TOPOLOGY_NODE_ADD, event);
  }

  public emitNodeRemove(topologyData: Omit<TopologyEvent, 'type' | 'timestamp' | 'action'>) {
    const event: TopologyEvent = {
      type: EventType.TOPOLOGY_NODE_REMOVE,
      timestamp: Date.now(),
      action: 'remove',
      ...topologyData
    };
    this.eventServer.emitEvent(EventType.TOPOLOGY_NODE_REMOVE, event);
  }

  public emitEdgeAdd(topologyData: Omit<TopologyEvent, 'type' | 'timestamp' | 'action'>) {
    const event: TopologyEvent = {
      type: EventType.TOPOLOGY_EDGE_ADD,
      timestamp: Date.now(),
      action: 'add',
      ...topologyData
    };
    this.eventServer.emitEvent(EventType.TOPOLOGY_EDGE_ADD, event);
  }

  public emitEdgeRemove(topologyData: Omit<TopologyEvent, 'type' | 'timestamp' | 'action'>) {
    const event: TopologyEvent = {
      type: EventType.TOPOLOGY_EDGE_REMOVE,
      timestamp: Date.now(),
      action: 'remove',
      ...topologyData
    };
    this.eventServer.emitEvent(EventType.TOPOLOGY_EDGE_REMOVE, event);
  }
}