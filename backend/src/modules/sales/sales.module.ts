import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { WsModule } from '../../websocket/ws.module';

@Module({ controllers: [SalesController], providers: [SalesService], imports: [WsModule] })
export class SalesModule {}
