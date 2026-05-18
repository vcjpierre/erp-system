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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customers with pagination' })
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
    return this.customersService.findAll(companyId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Get customer aging report' })
  getAgingReport(@CurrentUser('companyId') companyId: string) {
    return this.customersService.getAgingReport(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customersService.findOne(companyId, id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get customer balance' })
  getCustomerBalance(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customersService.getCustomerBalance(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a customer' })
  async remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    await this.customersService.remove(companyId, id);
  }
}
