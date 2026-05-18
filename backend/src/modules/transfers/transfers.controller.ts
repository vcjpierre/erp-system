import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.transfersService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.transfersService.findOne(req.user.companyId, id);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.transfersService.create(req.user.companyId, body);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.transfersService.update(req.user.companyId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.transfersService.remove(req.user.companyId, id);
  }

  @Post(':id/send')
  send(@Req() req: any, @Param('id') id: string) {
    return this.transfersService.send(req.user.companyId, id);
  }

  @Post(':id/receive')
  receive(@Req() req: any, @Param('id') id: string) {
    return this.transfersService.receive(req.user.companyId, id);
  }

  @Post(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.transfersService.cancel(req.user.companyId, id);
  }
}
