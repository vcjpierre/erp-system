import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('quotes')
  findAllQuotes(@CurrentUser('companyId') companyId: string) {
    return this.salesService.findAllQuotes(companyId);
  }

  @Post('quotes')
  createQuote(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.salesService.createQuote(companyId, userId, body);
  }

  @Get('quotes/:id')
  findQuote(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.salesService.findQuote(companyId, id);
  }

  @Post('quotes/:id/convert')
  convertQuoteToInvoice(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.salesService.convertQuoteToInvoice(companyId, userId, id);
  }

  @Get('sales-orders')
  findAllSalesOrders(@CurrentUser('companyId') companyId: string) {
    return this.salesService.findAllSalesOrders(companyId);
  }

  @Post('sales-orders')
  createSalesOrder(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createSalesOrder(companyId, body);
  }

  @Get('sales-orders/:id')
  findSalesOrder(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.salesService.findSalesOrder(companyId, id);
  }

  @Get('sales-targets')
  findAllSalesTargets(@CurrentUser('companyId') companyId: string) {
    return this.salesService.findAllSalesTargets(companyId);
  }

  @Post('sales-targets')
  createSalesTarget(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createSalesTarget(companyId, body);
  }

  @Get('commissions')
  findAllCommissions(@CurrentUser('companyId') companyId: string) {
    return this.salesService.findAllCommissions(companyId);
  }

  @Post('commissions')
  createCommission(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createCommission(companyId, body);
  }

  @Get('subscriptions')
  findAllSubscriptions(@CurrentUser('companyId') companyId: string) {
    return this.salesService.findAllSubscriptions(companyId);
  }

  @Post('subscriptions')
  createSubscription(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createSubscription(companyId, body);
  }
}
