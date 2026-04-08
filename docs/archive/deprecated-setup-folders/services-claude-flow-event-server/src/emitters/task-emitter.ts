import { EventEmitter } from 'events';
import { TaskEvent, EventType } from '../types/events';

export class TaskEmitter extends EventEmitter {
  constructor(private eventServer: any) {
    super();
  }

  public emitTaskStart(taskData: Omit<TaskEvent, 'type' | 'timestamp'>) {
    const event: TaskEvent = {
      type: EventType.TASK_START,
      timestamp: Date.now(),
      status: 'pending',
      ...taskData
    };
    this.eventServer.emitEvent(EventType.TASK_START, event);
  }

  public emitTaskProgress(taskData: Omit<TaskEvent, 'type' | 'timestamp'>) {
    const event: TaskEvent = {
      type: EventType.TASK_PROGRESS,
      timestamp: Date.now(),
      status: 'running',
      progress: taskData.progress || 0,
      ...taskData
    };
    this.eventServer.emitEvent(EventType.TASK_PROGRESS, event);
  }

  public emitTaskComplete(taskData: Omit<TaskEvent, 'type' | 'timestamp'>) {
    const event: TaskEvent = {
      type: EventType.TASK_COMPLETE,
      timestamp: Date.now(),
      status: 'completed',
      ...taskData
    };
    this.eventServer.emitEvent(EventType.TASK_COMPLETE, event);
  }

  public emitTaskError(taskData: Omit<TaskEvent, 'type' | 'timestamp'>) {
    const event: TaskEvent = {
      type: EventType.TASK_ERROR,
      timestamp: Date.now(),
      status: 'failed',
      ...taskData
    };
    this.eventServer.emitEvent(EventType.TASK_ERROR, event);
  }
}