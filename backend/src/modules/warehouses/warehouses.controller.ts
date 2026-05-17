import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.warehousesService.findAll(companyId, +page, +limit);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.warehousesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.warehousesService.remove(companyId, id);
  }
}
