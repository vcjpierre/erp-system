import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { WsModule } from '../../websocket/ws.module';

@Module({ controllers: [CrmController], providers: [CrmService], imports: [WsModule] })
export class CrmModule {}
