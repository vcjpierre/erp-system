import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Taxes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateTaxDto) {
    return this.taxesService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.taxesService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.taxesService.findOne(companyId, id);
  }

  @Put(':id')
  update(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() dto: UpdateTaxDto) {
    return this.taxesService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.taxesService.remove(companyId, id);
  }
}
