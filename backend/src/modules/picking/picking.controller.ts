import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PickingService } from './picking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Picking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('picking')
export class PickingController {
  constructor(private readonly pickingService: PickingService) {}

  @Get()
  findAllPickOrders(@Req() req: any) {
    return this.pickingService.findAllPickOrders(req.user.companyId);
  }

  @Get(':id')
  findOnePickOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.findOnePickOrder(req.user.companyId, id);
  }

  @Post()
  createPickOrder(@Req() req: any, @Body() body: any) {
    return this.pickingService.createPickOrder(req.user.companyId, body);
  }

  @Put(':id')
  updatePickOrder(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.pickingService.updatePickOrder(req.user.companyId, id, body);
  }

  @Delete(':id')
  removePickOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.removePickOrder(req.user.companyId, id);
  }

  @Post(':id/pick')
  pick(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.pick(req.user.companyId, id);
  }

  @Post(':id/assign')
  assign(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.pickingService.assign(req.user.companyId, id, body.assignedTo);
  }

  @Get('pack-orders')
  findAllPackOrders(@Req() req: any) {
    return this.pickingService.findAllPackOrders(req.user.companyId);
  }

  @Get('pack-orders/:id')
  findOnePackOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.findOnePackOrder(req.user.companyId, id);
  }

  @Post('pack-orders')
  createPackOrder(@Req() req: any, @Body() body: any) {
    return this.pickingService.createPackOrder(req.user.companyId, body);
  }

  @Put('pack-orders/:id')
  updatePackOrder(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.pickingService.updatePackOrder(req.user.companyId, id, body);
  }

  @Delete('pack-orders/:id')
  removePackOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.removePackOrder(req.user.companyId, id);
  }

  @Post('pack-orders/:id/pack')
  packPackOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.packPackOrder(req.user.companyId, id);
  }

  @Get('dispatch-orders')
  findAllDispatchOrders(@Req() req: any) {
    return this.pickingService.findAllDispatchOrders(req.user.companyId);
  }

  @Get('dispatch-orders/:id')
  findOneDispatchOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.findOneDispatchOrder(req.user.companyId, id);
  }

  @Post('dispatch-orders')
  createDispatchOrder(@Req() req: any, @Body() body: any) {
    return this.pickingService.createDispatchOrder(req.user.companyId, body);
  }

  @Put('dispatch-orders/:id')
  updateDispatchOrder(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.pickingService.updateDispatchOrder(req.user.companyId, id, body);
  }

  @Delete('dispatch-orders/:id')
  removeDispatchOrder(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.removeDispatchOrder(req.user.companyId, id);
  }

  @Post('dispatch-orders/:id/dispatch')
  dispatch(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.dispatch(req.user.companyId, id);
  }

  @Post('dispatch-orders/:id/deliver')
  deliver(@Req() req: any, @Param('id') id: string) {
    return this.pickingService.deliver(req.user.companyId, id);
  }
}
