import { Module } from '@nestjs/common';
import { CostingController } from './costing.controller';
import { CostingService } from './costing.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostingController],
  providers: [CostingService],
})
export class CostingModule {}
