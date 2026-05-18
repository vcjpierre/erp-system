import {
  Controller, Get, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post('currencies/:currencyId/exchange-rates')
  create(
    @CurrentUser('companyId') companyId: string,
    @Param('currencyId') currencyId: string,
    @Body() dto: CreateExchangeRateDto,
  ) {
    return this.exchangeRatesService.create(currencyId, companyId, dto);
  }

  @Get('currencies/:currencyId/exchange-rates')
  findByCurrency(
    @CurrentUser('companyId') companyId: string,
    @Param('currencyId') currencyId: string,
  ) {
    return this.exchangeRatesService.findByCurrency(currencyId, companyId);
  }

  @Get('exchange-rates/current')
  getCurrentRates(@CurrentUser('companyId') companyId: string) {
    return this.exchangeRatesService.getCurrentRates(companyId);
  }

  @Delete('currencies/:currencyId/exchange-rates/:id')
  remove(
    @CurrentUser('companyId') companyId: string,
    @Param('currencyId') currencyId: string,
    @Param('id') id: string,
  ) {
    return this.exchangeRatesService.remove(currencyId, id, companyId);
  }
}
