import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  getHealth(@Req() req: any) {
    return this.monitoringService.getHealth();
  }

  @Get('metrics')
  getMetrics(@Req() req: any) {
    return this.monitoringService.getMetrics(req.user.companyId);
  }

  @Post('cache/clear')
  clearCache() {
    return this.monitoringService.clearCache();
  }

  @Get('db/connections')
  getDbConnections() {
    return this.monitoringService.getDbConnections();
  }

  @Get('db/slow-queries')
  getSlowQueries() {
    return this.monitoringService.getSlowQueries();
  }

  @Get('performance')
  getPerformance() {
    return this.monitoringService.getPerformance();
  }

  @Get('activity')
  getActivity(@Req() req: any) {
    return this.monitoringService.getActivity(req.user.companyId);
  }

  @Get('logs')
  getLogs(@Req() req: any) {
    return this.monitoringService.getLogs(req.user.companyId);
  }
}
