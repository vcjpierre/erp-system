import { Global, Module } from '@nestjs/common';
import { EventBus } from './event-bus';
import { EventListeners } from './event-listeners';

@Global()
@Module({
  providers: [EventBus, EventListeners],
  exports: [EventBus],
})
export class EventModule {}
