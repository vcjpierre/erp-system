import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InvoicingService } from './invoicing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Invoicing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InvoicingController {
  constructor(private readonly invoicingService: InvoicingService) {}

  @Post('invoices')
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicingService.createInvoice(companyId, dto);
  }

  @Get('invoices')
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.invoicingService.getInvoices(companyId, { status, customerId, dateFrom, dateTo }, +page, +limit);
  }

  @Get('invoices/overdue')
  getOverdue(@CurrentUser('companyId') companyId: string) {
    return this.invoicingService.getOverdueInvoices(companyId);
  }

  @Get('invoices/:id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.invoicingService.getInvoice(companyId, id);
  }

  @Put('invoices/:id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicingService.updateInvoice(companyId, id, dto);
  }

  @Post('invoices/:id/approve')
  approve(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.invoicingService.approveInvoice(companyId, id);
  }

  @Post('invoices/:id/post')
  post(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.invoicingService.postInvoice(companyId, id);
  }

  @Post('invoices/:id/cancel')
  cancel(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelInvoiceDto,
  ) {
    return this.invoicingService.cancelInvoice(companyId, id, dto.reason);
  }

  @Get('customers/:customerId/invoices')
  getCustomerInvoices(
    @Param('customerId') customerId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.invoicingService.getCustomerInvoices(customerId, +page, +limit);
  }
}
