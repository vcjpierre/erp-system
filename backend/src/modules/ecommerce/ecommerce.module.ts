import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { WsModule } from '../../websocket/ws.module';
import { EcommerceController } from './ecommerce.controller';
import { EcommerceService } from './ecommerce.service';

@Module({
  imports: [PrismaModule, WsModule],
  controllers: [EcommerceController],
  providers: [EcommerceService],
})
export class EcommerceModule {}
