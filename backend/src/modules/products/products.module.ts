import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { WsModule } from '../../websocket/ws.module';

@Module({ controllers: [ProductsController], providers: [ProductsService], imports: [WsModule] })
export class ProductsModule {}
