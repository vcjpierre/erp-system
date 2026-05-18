import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchasingService } from './purchasing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Purchasing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Get('purchase-requests')
  findAllRequests(@CurrentUser('companyId') companyId: string) {
    return this.purchasingService.findAllRequests(companyId);
  }

  @Post('purchase-requests')
  createRequest(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.purchasingService.createRequest(companyId, userId, body);
  }

  @Post('purchase-requests/:id/approve')
  approveRequest(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.purchasingService.approveRequest(companyId, userId, id);
  }

  @Get('purchase-orders')
  findAllOrders(@CurrentUser('companyId') companyId: string) {
    return this.purchasingService.findAllOrders(companyId);
  }

  @Post('purchase-orders')
  createOrder(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.purchasingService.createOrder(companyId, body);
  }

  @Get('receivings')
  findAllReceivings(@CurrentUser('companyId') companyId: string) {
    return this.purchasingService.findAllReceivings(companyId);
  }

  @Post('receivings')
  receiveOrder(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.purchasingService.receiveOrder(companyId, body);
  }

  @Post('supplier-evaluations')
  createSupplierEvaluation(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.purchasingService.createSupplierEvaluation(companyId, body);
  }

  @Get('supplier-evaluations/:supplierId')
  findEvaluationsBySupplier(@CurrentUser('companyId') companyId: string, @Param('supplierId') supplierId: string) {
    return this.purchasingService.findEvaluationsBySupplier(companyId, supplierId);
  }
}
