import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cost Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateCostCenterDto) {
    return this.costCentersService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.costCentersService.findAll(companyId, +page, +limit);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.costCentersService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.costCentersService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.costCentersService.remove(companyId, id);
  }

  // ───────── Budget ─────────

  @Post(':id/budget')
  setBudget(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Query('accountId') accountId: string,
    @Query('year') year: number,
    @Body('amount') amount: number,
  ) {
    return this.costCentersService.setBudget(companyId, id, accountId, +year, amount);
  }

  @Get(':id/budget/summary')
  getBudgetSummary(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Query('year') year: number,
  ) {
    return this.costCentersService.getBudgetSummary(companyId, id, +year);
  }
}
