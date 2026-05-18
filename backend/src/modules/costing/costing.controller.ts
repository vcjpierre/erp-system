import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CostingService } from './costing.service';

@UseGuards(JwtAuthGuard)
@Controller('costing')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Get('layers')
  findAllLayers(@Req() req: any, @Query('productId') productId?: string, @Query('warehouseId') warehouseId?: string) {
    return this.costingService.findAllLayers(req.user.companyId, productId, warehouseId);
  }

  @Get('layers/:id')
  findOneLayer(@Param('id') id: string) {
    return this.costingService.findOneLayer(id);
  }

  @Post('layers')
  createLayer(@Req() req: any, @Body() body: any) {
    return this.costingService.createLayer(req.user.companyId, body);
  }

  @Put('layers/:id')
  updateLayer(@Param('id') id: string, @Body() body: any) {
    return this.costingService.updateLayer(id, body);
  }

  @Delete('layers/:id')
  removeLayer(@Param('id') id: string) {
    return this.costingService.removeLayer(id);
  }

  @Post('calculate')
  calculateAverageCost(@Req() req: any, @Body() body: any) {
    return this.costingService.calculateAverageCost(req.user.companyId, body.productId, body.warehouseId);
  }

  @Get('value/:productId')
  getProductValuation(@Req() req: any, @Param('productId') productId: string) {
    return this.costingService.getProductValuation(req.user.companyId, productId);
  }

  @Get('value')
  getTotalValuation(@Req() req: any) {
    return this.costingService.getTotalValuation(req.user.companyId);
  }
}
