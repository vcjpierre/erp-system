import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountingPeriodsService } from './accounting-periods.service';
import { ClosePeriodDto } from './dto/close-period.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Accounting Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting-periods')
export class AccountingPeriodsController {
  constructor(private readonly accountingPeriodsService: AccountingPeriodsService) {}

  @Post()
  create(
    @CurrentUser('companyId') companyId: string,
    @Body('year') year: number,
    @Body('month') month: number,
  ) {
    return this.accountingPeriodsService.create(companyId, +year, +month);
  }

  @Get()
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 24,
  ) {
    return this.accountingPeriodsService.findAll(companyId, +page, +limit);
  }

  @Get('open')
  getOpen(@CurrentUser('companyId') companyId: string) {
    return this.accountingPeriodsService.getOpenPeriods(companyId);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.accountingPeriodsService.findOne(companyId, id);
  }

  @Post(':id/close')
  close(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: ClosePeriodDto,
  ) {
    return this.accountingPeriodsService.closePeriod(companyId, userId, id, dto.password);
  }

  @Post(':id/reopen')
  reopen(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.accountingPeriodsService.reopenPeriod(companyId, id);
  }
}
