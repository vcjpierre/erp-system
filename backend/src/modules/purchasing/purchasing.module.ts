import { Module } from '@nestjs/common';
import { PurchasingController } from './purchasing.controller';
import { PurchasingService } from './purchasing.service';
import { WsModule } from '../../websocket/ws.module';

@Module({ controllers: [PurchasingController], providers: [PurchasingService], imports: [WsModule] })
export class PurchasingModule {}
