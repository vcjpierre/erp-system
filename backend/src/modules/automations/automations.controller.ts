import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationsService } from './automations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Automations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post('approvals')
  createApproval(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.automationsService.createApproval(companyId, userId, body);
  }

  @Post('approvals/:id/respond')
  respondToApproval(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.automationsService.respondToApproval(companyId, userId, id, body);
  }

  @Get('approvals/pending')
  findPendingApprovals(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.automationsService.findPendingApprovals(companyId, userId);
  }

  @Get('business-rules')
  findAllBusinessRules(@CurrentUser('companyId') companyId: string) {
    return this.automationsService.findAllBusinessRules(companyId);
  }

  @Post('business-rules')
  createBusinessRule(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.automationsService.createBusinessRule(companyId, body);
  }

  @Post('evaluate')
  evaluate(
    @CurrentUser('companyId') companyId: string,
    @Body('trigger') trigger: string,
    @Body('context') context: any,
  ) {
    return this.automationsService.evaluate(companyId, trigger, context);
  }
}
