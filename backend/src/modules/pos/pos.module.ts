import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { WsModule } from '../../websocket/ws.module';

@Module({
  imports: [WsModule],
  controllers: [PosController],
  providers: [PosService],
})
export class PosModule {}
