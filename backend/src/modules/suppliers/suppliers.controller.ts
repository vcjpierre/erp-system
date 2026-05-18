import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List suppliers with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.suppliersService.findAll(companyId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by id' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.suppliersService.findOne(companyId, id);
  }

  @Get(':id/purchases')
  @ApiOperation({ summary: 'Get purchases from a supplier' })
  getPurchases(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.suppliersService.getSupplierPurchases(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a supplier' })
  async remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    await this.suppliersService.remove(companyId, id);
  }
}
