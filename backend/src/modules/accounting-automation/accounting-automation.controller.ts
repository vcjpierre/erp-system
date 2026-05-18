import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountingAutomationService } from './accounting-automation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Accounting Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting-automation')
export class AccountingAutomationController {
  constructor(private readonly service: AccountingAutomationService) {}

  @Get('trigger/invoice/:invoiceId')
  @ApiOperation({ summary: 'Manually trigger invoice journal entry generation' })
  triggerInvoice(
    @CurrentUser('companyId') _companyId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.service.generateInvoiceEntry(invoiceId);
  }

  @Get('trigger/payment/:paymentId')
  @ApiOperation({ summary: 'Manually trigger payment journal entry generation' })
  triggerPayment(
    @CurrentUser('companyId') _companyId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.service.generatePaymentEntry(paymentId);
  }

  @Get('trigger/purchase/:invoiceId')
  @ApiOperation({ summary: 'Manually trigger purchase journal entry generation' })
  triggerPurchase(
    @CurrentUser('companyId') _companyId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.service.generatePurchaseEntry(invoiceId);
  }

  @Get('trigger/credit-note/:creditNoteId')
  @ApiOperation({ summary: 'Manually trigger credit note journal entry generation' })
  triggerCreditNote(
    @CurrentUser('companyId') _companyId: string,
    @Param('creditNoteId') creditNoteId: string,
  ) {
    return this.service.generateCreditNoteEntry(creditNoteId);
  }

  @Get('trigger/closing/:periodId')
  @ApiOperation({ summary: 'Manually trigger closing entry generation' })
  triggerClosing(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.service.generateClosingEntry(companyId, periodId, userId);
  }
}
