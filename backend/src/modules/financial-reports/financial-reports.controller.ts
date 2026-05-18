import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinancialReportsService } from './financial-reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Financial Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial-reports')
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get balance sheet' })
  getBalanceSheet(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.financialReportsService.getBalanceSheet(companyId, periodId);
  }

  @Get('income-statement')
  @ApiOperation({ summary: 'Get income statement' })
  getIncomeStatement(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.financialReportsService.getIncomeStatement(companyId, periodId);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow statement' })
  getCashFlow(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.financialReportsService.getCashFlow(companyId, periodId);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  getTrialBalance(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.financialReportsService.getTrialBalance(companyId, periodId);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get financial KPIs' })
  getFinancialKpis(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.financialReportsService.getFinancialKpis(companyId, periodId);
  }

  @Get('account-statement/:accountId')
  @ApiOperation({ summary: 'Get account statement with running balance' })
  getAccountStatement(
    @CurrentUser('companyId') companyId: string,
    @Param('accountId') accountId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.financialReportsService.getAccountStatement(companyId, accountId, periodId);
  }
}
