import { Module } from '@nestjs/common';
import { LogisticsDashboardController } from './logistics-dashboard.controller';
import { LogisticsDashboardService } from './logistics-dashboard.service';

@Module({ controllers: [LogisticsDashboardController], providers: [LogisticsDashboardService] })
export class LogisticsDashboardModule {}
