import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KardexService } from './kardex.service';

@UseGuards(JwtAuthGuard)
@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Get()
  findAll(@Req() req: any, @Query() query?: any) {
    return this.kardexService.findAll(req.user.companyId, query);
  }

  @Get('lots')
  findAllLots(@Req() req: any, @Query('productId') productId?: string) {
    return this.kardexService.findAllLots(req.user.companyId, productId);
  }

  @Get('lots/:id')
  findOneLot(@Param('id') id: string) {
    return this.kardexService.findOneLot(id);
  }

  @Post('lots')
  createLot(@Req() req: any, @Body() body: any) {
    return this.kardexService.createLot(req.user.companyId, body);
  }

  @Put('lots/:id')
  updateLot(@Param('id') id: string, @Body() body: any) {
    return this.kardexService.updateLot(id, body);
  }

  @Delete('lots/:id')
  removeLot(@Param('id') id: string) {
    return this.kardexService.removeLot(id);
  }

  @Get('serials')
  findAllSerials(@Req() req: any, @Query('productId') productId?: string, @Query('status') status?: string) {
    return this.kardexService.findAllSerials(req.user.companyId, productId, status);
  }

  @Get('serials/:id')
  findOneSerial(@Param('id') id: string) {
    return this.kardexService.findOneSerial(id);
  }

  @Post('serials')
  createSerial(@Req() req: any, @Body() body: any) {
    return this.kardexService.createSerial(req.user.companyId, body);
  }

  @Put('serials/:id')
  updateSerial(@Param('id') id: string, @Body() body: any) {
    return this.kardexService.updateSerial(id, body);
  }

  @Delete('serials/:id')
  removeSerial(@Param('id') id: string) {
    return this.kardexService.removeSerial(id);
  }

  @Get('trace/:productId/:serialNumber')
  traceSerial(@Param('productId') productId: string, @Param('serialNumber') serialNumber: string) {
    return this.kardexService.traceSerial(productId, serialNumber);
  }

  @Get('expiry/:days')
  findExpiringLots(@Req() req: any, @Param('days') days: number) {
    return this.kardexService.findExpiringLots(req.user.companyId, Number(days));
  }

  @Get('product/:productId')
  findByProduct(@Req() req: any, @Param('productId') productId: string) {
    return this.kardexService.findByProduct(req.user.companyId, productId);
  }

  @Get('warehouse/:warehouseId')
  findByWarehouse(@Req() req: any, @Param('warehouseId') warehouseId: string) {
    return this.kardexService.findByWarehouse(req.user.companyId, warehouseId);
  }

  @Get('lot/:lotId')
  findByLot(@Req() req: any, @Param('lotId') lotId: string) {
    return this.kardexService.findByLot(req.user.companyId, lotId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kardexService.findOne(id);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.kardexService.create(req.user.companyId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kardexService.remove(id);
  }
}
