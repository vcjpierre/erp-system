import { Module } from '@nestjs/common';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { WsModule } from '../../websocket/ws.module';

@Module({ controllers: [AutomationsController], providers: [AutomationsService], imports: [WsModule] })
export class AutomationsModule {}
