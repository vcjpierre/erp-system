import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('POS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('sessions/open')
  openSession(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.posService.openSession(companyId, userId, body);
  }

  @Post('sessions/:id/close')
  closeSession(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.posService.closeSession(companyId, userId, id, body);
  }

  @Get('sessions')
  findAllSessions(@CurrentUser('companyId') companyId: string) {
    return this.posService.findAllSessions(companyId);
  }

  @Get('sessions/:id')
  findSession(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.posService.findSession(companyId, id);
  }

  @Post('sessions/:id/movements')
  addMovement(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.posService.addMovement(companyId, id, body);
  }
}
