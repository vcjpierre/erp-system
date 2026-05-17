import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.branchesService.findAll(companyId, +page, +limit);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.branchesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.branchesService.remove(companyId, id);
  }
}
