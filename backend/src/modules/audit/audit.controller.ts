import {
  Controller, Get, Delete, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'List audit logs with pagination and filters' })
  findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll(req.user.companyId, {
      page: +page, limit: +limit, action, entity, entityId, userId, startDate, endDate,
    });
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get single audit log detail' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.auditService.findOne(req.user.companyId, id);
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Get entity history' })
  findByEntity(
    @Req() req: any,
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(req.user.companyId, entity, entityId);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user activity' })
  findByUser(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.auditService.findByUser(req.user.companyId, userId, +page, +limit);
  }

  @Delete('logs/:id')
  @ApiOperation({ summary: 'Delete audit log (admin only)' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.auditService.remove(req.user.companyId, id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  getStats(@Req() req: any) {
    return this.auditService.getStats(req.user.companyId);
  }
}
