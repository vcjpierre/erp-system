import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrencyRevaluationService } from './currency-revaluation.service';
import { RunRevaluationDto } from './dto/run-revaluation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Currency Revaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting/revaluation')
export class CurrencyRevaluationController {
  constructor(private readonly currencyRevaluationService: CurrencyRevaluationService) {}

  @Post('run')
  run(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RunRevaluationDto,
  ) {
    return this.currencyRevaluationService.run(companyId, userId, dto);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.currencyRevaluationService.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.currencyRevaluationService.findOne(companyId, id);
  }
}
