import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ManufacturingService } from './manufacturing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Manufacturing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('manufacturing')
export class ManufacturingController {
  constructor(private readonly manufacturingService: ManufacturingService) {}

  // ─── BOM ───

  @Get('boms')
  findAllBoms(@Req() req: any) {
    return this.manufacturingService.findAllBoms(req.user.companyId);
  }

  @Get('boms/:id')
  findOneBom(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.findOneBom(req.user.companyId, id);
  }

  @Post('boms')
  createBom(@Req() req: any, @Body() body: any) {
    return this.manufacturingService.createBom(req.user.companyId, body);
  }

  @Put('boms/:id')
  updateBom(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.manufacturingService.updateBom(req.user.companyId, id, body);
  }

  @Delete('boms/:id')
  removeBom(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.removeBom(req.user.companyId, id);
  }

  // ─── Work Centers ───

  @Get('work-centers')
  findAllWorkCenters(@Req() req: any) {
    return this.manufacturingService.findAllWorkCenters(req.user.companyId);
  }

  @Get('work-centers/:id')
  findOneWorkCenter(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.findOneWorkCenter(req.user.companyId, id);
  }

  @Post('work-centers')
  createWorkCenter(@Req() req: any, @Body() body: any) {
    return this.manufacturingService.createWorkCenter(req.user.companyId, body);
  }

  @Put('work-centers/:id')
  updateWorkCenter(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.manufacturingService.updateWorkCenter(req.user.companyId, id, body);
  }

  @Delete('work-centers/:id')
  removeWorkCenter(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.removeWorkCenter(req.user.companyId, id);
  }

  @Post('work-centers/:id/operations')
  addOperation(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.manufacturingService.addOperation(req.user.companyId, id, body);
  }

  @Delete('work-centers/:id/operations/:opId')
  removeOperation(@Req() req: any, @Param('id') id: string, @Param('opId') opId: string) {
    return this.manufacturingService.removeOperation(req.user.companyId, id, opId);
  }

  // ─── Production Orders ───

  @Get('orders')
  findAllOrders(@Req() req: any) {
    return this.manufacturingService.findAllOrders(req.user.companyId);
  }

  @Get('orders/:id')
  findOneOrder(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.findOneOrder(req.user.companyId, id);
  }

  @Post('orders')
  createOrder(@Req() req: any, @Body() body: any) {
    return this.manufacturingService.createOrder(req.user.companyId, body);
  }

  @Put('orders/:id')
  updateOrder(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.manufacturingService.updateOrder(req.user.companyId, id, body);
  }

  @Delete('orders/:id')
  removeOrder(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.removeOrder(req.user.companyId, id);
  }

  @Post('orders/:id/start')
  startOrder(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.startOrder(req.user.companyId, id);
  }

  @Post('orders/:id/complete')
  completeOrder(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.completeOrder(req.user.companyId, id);
  }

  @Post('orders/:id/cancel')
  cancelOrder(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.cancelOrder(req.user.companyId, id);
  }

  // ─── MRP ───

  @Get('mrp')
  findAllRecommendations(@Req() req: any) {
    return this.manufacturingService.findAllRecommendations(req.user.companyId);
  }

  @Post('mrp/calculate')
  calculateMrp(@Req() req: any) {
    return this.manufacturingService.calculateMrp(req.user.companyId);
  }

  @Post('mrp/:id/execute')
  executeRecommendation(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.executeRecommendation(req.user.companyId, id);
  }

  @Post('mrp/:id/dismiss')
  dismissRecommendation(@Req() req: any, @Param('id') id: string) {
    return this.manufacturingService.dismissRecommendation(req.user.companyId, id);
  }
}
