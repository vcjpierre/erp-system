import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.registerPayment(companyId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.paymentsService.getPayments(companyId, +page, +limit);
  }

  @Get('invoice/:invoiceId')
  getInvoicePayments(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.getInvoicePayments(invoiceId);
  }
}
