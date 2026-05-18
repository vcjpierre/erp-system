import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CancelJournalEntryDto } from './dto/cancel-journal-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ───────── Accounts ─────────

  @Post('accounts')
  createAccount(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountingService.createAccount(companyId, dto);
  }

  @Get('accounts/tree')
  getChartOfAccounts(@CurrentUser('companyId') companyId: string) {
    return this.accountingService.getChartOfAccounts(companyId);
  }

  @Get('accounts/:id')
  getAccount(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.accountingService.getAccount(companyId, id);
  }

  @Put('accounts/:id')
  updateAccount(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountingService.updateAccount(companyId, id, dto);
  }

  // ───────── Journal Entries ─────────

  @Post('journal-entries')
  createJournalEntry(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.accountingService.createJournalEntry(companyId, userId, dto);
  }

  @Get('journal-entries')
  getJournalEntries(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.accountingService.getJournalEntries(companyId, periodId, +page, +limit);
  }

  @Get('journal-entries/:id')
  getJournalEntry(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.accountingService.getJournalEntry(companyId, id);
  }

  @Post('journal-entries/:id/post')
  postJournalEntry(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.accountingService.postJournalEntry(companyId, id);
  }

  @Post('journal-entries/:id/cancel')
  cancelJournalEntry(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelJournalEntryDto,
  ) {
    return this.accountingService.cancelJournalEntry(companyId, id, dto.reason);
  }

  // ───────── Reports ─────────

  @Get('trial-balance')
  getTrialBalance(
    @CurrentUser('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.accountingService.getTrialBalance(companyId, periodId);
  }

  @Get('ledger/:accountId')
  getLedger(
    @CurrentUser('companyId') companyId: string,
    @Param('accountId') accountId: string,
    @Query('periodId') periodId?: string,
  ) {
    return this.accountingService.getLedger(companyId, accountId, periodId);
  }
}
