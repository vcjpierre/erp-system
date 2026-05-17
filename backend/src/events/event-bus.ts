import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface AppEvent {
  name: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  companyId?: string;
}

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);

  constructor(private eventEmitter: EventEmitter2) {}

  async emit(event: string, data: Record<string, unknown>, meta?: { userId?: string; companyId?: string }): Promise<void> {
    const appEvent: AppEvent = {
      name: event,
      data,
      timestamp: new Date(),
      ...meta,
    };

    this.logger.debug(`Event emitted: ${event}`);
    this.eventEmitter.emit(event, appEvent);
  }

  async emitAsync(event: string, data: Record<string, unknown>, meta?: { userId?: string; companyId?: string }): Promise<void> {
    const appEvent: AppEvent = {
      name: event,
      data,
      timestamp: new Date(),
      ...meta,
    };

    this.logger.debug(`Async event emitted: ${event}`);
    await this.eventEmitter.emitAsync(event, appEvent);
  }
}
