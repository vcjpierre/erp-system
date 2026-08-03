import {
  Controller, Get, Post, Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EcommerceService } from './ecommerce.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Ecommerce')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  @Post('sync-products')
  syncProducts(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.syncProducts(companyId);
  }

  @Get('sync-products')
  findSyncProducts(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.findSyncProducts(companyId);
  }

  @Post('sync-stock')
  syncStock(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.syncStock(companyId);
  }

  @Get('sync-orders')
  findSyncOrders(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.findSyncOrders(companyId);
  }

  @Post('sync-pending')
  processPending(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.processPending(companyId);
  }

  @Get('orders')
  findOrders(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.findOrders(companyId);
  }

  @Post('orders')
  createOrder(@Req() req: any, @Body() body: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.createOrder(companyId, body);
  }

  @Get('catalog')
  getCatalog(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.ecommerceService.getCatalog(companyId);
  }

  @Get('catalog/:code')
  getCatalogProduct(@Req() req: any, @Param('code') code: string) {
    const companyId = req.user.companyId;
    return this.ecommerceService.getCatalogProduct(companyId, code);
  }
}
