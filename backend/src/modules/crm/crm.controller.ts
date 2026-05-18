import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('CRM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('leads')
  findAllLeads(@CurrentUser('companyId') companyId: string) {
    return this.crmService.findAllLeads(companyId);
  }

  @Post('leads')
  createLead(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createLead(companyId, body);
  }

  @Get('leads/:id')
  findLead(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.crmService.findLead(companyId, id);
  }

  @Put('leads/:id')
  updateLead(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
    return this.crmService.updateLead(companyId, id, body);
  }

  @Delete('leads/:id')
  removeLead(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.crmService.removeLead(companyId, id);
  }

  @Get('pipelines')
  findAllPipelines(@CurrentUser('companyId') companyId: string) {
    return this.crmService.findAllPipelines(companyId);
  }

  @Post('pipelines')
  createPipeline(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createPipeline(companyId, body);
  }

  @Get('deals')
  findAllDeals(@CurrentUser('companyId') companyId: string) {
    return this.crmService.findAllDeals(companyId);
  }

  @Post('deals')
  createDeal(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createDeal(companyId, body);
  }

  @Patch('deals/:id/stage')
  updateDealStage(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('pipelineStageId') pipelineStageId: string,
  ) {
    return this.crmService.updateDealStage(companyId, id, pipelineStageId);
  }

  @Get('activities')
  findAllActivities(@CurrentUser('companyId') companyId: string) {
    return this.crmService.findAllActivities(companyId);
  }

  @Post('activities')
  createActivity(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.crmService.createActivity(companyId, userId, body);
  }

  @Get('follow-ups')
  findAllFollowUps(@CurrentUser('companyId') companyId: string) {
    return this.crmService.findAllFollowUps(companyId);
  }

  @Post('follow-ups')
  createFollowUp(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.crmService.createFollowUp(companyId, body);
  }
}
