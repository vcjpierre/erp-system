import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsDashboardService } from './logistics-dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Logistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logistics')
export class LogisticsDashboardController {
  constructor(private readonly logisticsService: LogisticsDashboardService) {}

  @Get('critical-stock')
  getCriticalStock(@Req() req: any) {
    return this.logisticsService.getCriticalStock(req.user.companyId);
  }

  @Get('rotation')
  getRotation(@Req() req: any, @Query('days') days?: string) {
    return this.logisticsService.getRotation(req.user.companyId, days ? parseInt(days, 10) : undefined);
  }

  @Get('valuation')
  getValuation(@Req() req: any) {
    return this.logisticsService.getValuation(req.user.companyId);
  }

  @Get('movements')
  getRecentMovements(@Req() req: any, @Query('limit') limit?: string) {
    return this.logisticsService.getRecentMovements(req.user.companyId, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('efficiency')
  getEfficiency(@Req() req: any) {
    return this.logisticsService.getEfficiency(req.user.companyId);
  }
}
