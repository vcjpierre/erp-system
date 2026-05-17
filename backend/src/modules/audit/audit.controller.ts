import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs for company' })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.auditService.findAll(companyId, +page, +limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user' })
  findByUser(
    @CurrentUser('companyId') companyId: string,
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.auditService.findByUser(companyId, userId, +page, +limit);
  }
}
