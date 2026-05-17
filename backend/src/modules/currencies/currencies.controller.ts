import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Currencies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateCurrencyDto) {
    return this.currenciesService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.currenciesService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.currenciesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.currenciesService.remove(companyId, id);
  }
}
