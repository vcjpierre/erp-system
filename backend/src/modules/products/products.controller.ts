import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() body: any) {
    return this.productsService.create(companyId, body);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.productsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.productsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.productsService.update(companyId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.productsService.remove(companyId, id);
  }

  @Post(':productId/stock')
  updateStock(
    @CurrentUser('companyId') companyId: string,
    @Param('productId') productId: string,
    @Body('warehouseId') warehouseId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateStock(companyId, productId, warehouseId, quantity);
  }
}
