import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BiService } from './bi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('BI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get('dashboards')
  findAllDashboards(@Req() req: any) {
    return this.biService.findAllDashboards(req.user.companyId);
  }

  @Get('dashboards/:id')
  findDashboard(@Req() req: any, @Param('id') id: string) {
    return this.biService.findDashboard(req.user.companyId, id);
  }

  @Post('dashboards')
  createDashboard(@Req() req: any, @Body() body: any) {
    return this.biService.createDashboard(req.user.companyId, body);
  }

  @Put('dashboards/:id')
  updateDashboard(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.biService.updateDashboard(req.user.companyId, id, body);
  }

  @Delete('dashboards/:id')
  removeDashboard(@Req() req: any, @Param('id') id: string) {
    return this.biService.removeDashboard(req.user.companyId, id);
  }

  @Post('dashboards/:id/layout')
  saveLayout(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.biService.saveLayout(req.user.companyId, id, body);
  }

  @Post('dashboards/:id/widgets')
  addWidget(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.biService.addWidget(req.user.companyId, id, body);
  }

  @Put('dashboards/:id/widgets/:widgetId')
  updateWidget(@Req() req: any, @Param('id') id: string, @Param('widgetId') widgetId: string, @Body() body: any) {
    return this.biService.updateWidget(req.user.companyId, id, widgetId, body);
  }

  @Delete('dashboards/:id/widgets/:widgetId')
  removeWidget(@Req() req: any, @Param('id') id: string, @Param('widgetId') widgetId: string) {
    return this.biService.removeWidget(req.user.companyId, id, widgetId);
  }

  @Get('reports')
  findAllReports(@Req() req: any) {
    return this.biService.findAllReports(req.user.companyId);
  }

  @Get('reports/:id')
  findReport(@Req() req: any, @Param('id') id: string) {
    return this.biService.findReport(req.user.companyId, id);
  }

  @Post('reports')
  createReport(@Req() req: any, @Body() body: any) {
    return this.biService.createReport(req.user.companyId, req.user.sub, body);
  }

  @Put('reports/:id')
  updateReport(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.biService.updateReport(req.user.companyId, id, body);
  }

  @Delete('reports/:id')
  removeReport(@Req() req: any, @Param('id') id: string) {
    return this.biService.removeReport(req.user.companyId, id);
  }

  @Post('reports/:id/schedules')
  addSchedule(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.biService.addSchedule(req.user.companyId, id, body);
  }

  @Delete('reports/:id/schedules/:scheduleId')
  removeSchedule(@Req() req: any, @Param('id') id: string, @Param('scheduleId') scheduleId: string) {
    return this.biService.removeSchedule(req.user.companyId, id, scheduleId);
  }

  @Post('reports/:id/export')
  exportReport(@Req() req: any, @Param('id') id: string) {
    return this.biService.exportReport(req.user.companyId, id);
  }

  @Get('filters')
  findAllFilters(@Req() req: any) {
    return this.biService.findAllFilters(req.user.sub);
  }

  @Post('filters')
  createFilter(@Req() req: any, @Body() body: any) {
    return this.biService.createFilter(req.user.companyId, req.user.sub, body);
  }

  @Delete('filters/:id')
  removeFilter(@Req() req: any, @Param('id') id: string) {
    return this.biService.removeFilter(req.user.sub, id);
  }

  @Get('kpis')
  getKpis(@Req() req: any) {
    return this.biService.getKpis(req.user.companyId);
  }
}
