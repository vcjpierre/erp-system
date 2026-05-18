import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Req() req: any, @Query() query?: any) {
    return this.inventoryService.findAll(req.user.companyId, query);
  }

  @Get('locations')
  findAllLocations(@Req() req: any) {
    return this.inventoryService.findAllLocations(req.user.companyId);
  }

  @Get('locations/:id')
  findOneLocation(@Param('id') id: string) {
    return this.inventoryService.findOneLocation(id);
  }

  @Post('locations')
  createLocation(@Req() req: any, @Body() body: any) {
    return this.inventoryService.createLocation(req.user.companyId, body);
  }

  @Put('locations/:id')
  updateLocation(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateLocation(id, body);
  }

  @Delete('locations/:id')
  removeLocation(@Param('id') id: string) {
    return this.inventoryService.removeLocation(id);
  }

  @Get('adjustments')
  findAllAdjustments(@Req() req: any) {
    return this.inventoryService.findAllAdjustments(req.user.companyId);
  }

  @Get('adjustments/:id')
  findOneAdjustment(@Param('id') id: string) {
    return this.inventoryService.findOneAdjustment(id);
  }

  @Post('adjustments')
  createAdjustment(@Req() req: any, @Body() body: any) {
    return this.inventoryService.createAdjustment(req.user.companyId, body);
  }

  @Put('adjustments/:id')
  updateAdjustment(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateAdjustment(id, body);
  }

  @Delete('adjustments/:id')
  removeAdjustment(@Param('id') id: string) {
    return this.inventoryService.removeAdjustment(id);
  }

  @Get('physical-counts')
  findAllPhysicalCounts(@Req() req: any) {
    return this.inventoryService.findAllPhysicalCounts(req.user.companyId);
  }

  @Get('physical-counts/:id')
  findOnePhysicalCount(@Param('id') id: string) {
    return this.inventoryService.findOnePhysicalCount(id);
  }

  @Post('physical-counts')
  createPhysicalCount(@Req() req: any, @Body() body: any) {
    return this.inventoryService.createPhysicalCount(req.user.companyId, body);
  }

  @Put('physical-counts/:id')
  updatePhysicalCount(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updatePhysicalCount(id, body);
  }

  @Delete('physical-counts/:id')
  removePhysicalCount(@Param('id') id: string) {
    return this.inventoryService.removePhysicalCount(id);
  }

  @Get('product/:productId')
  findByProduct(@Req() req: any, @Param('productId') productId: string) {
    return this.inventoryService.findByProduct(req.user.companyId, productId);
  }

  @Get('warehouse/:warehouseId')
  findByWarehouse(@Req() req: any, @Param('warehouseId') warehouseId: string) {
    return this.inventoryService.findByWarehouse(req.user.companyId, warehouseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.inventoryService.create(req.user.companyId, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
