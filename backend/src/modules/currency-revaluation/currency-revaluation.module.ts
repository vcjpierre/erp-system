import { Module } from '@nestjs/common';
import { CurrencyRevaluationController } from './currency-revaluation.controller';
import { CurrencyRevaluationService } from './currency-revaluation.service';

@Module({ controllers: [CurrencyRevaluationController], providers: [CurrencyRevaluationService] })
export class CurrencyRevaluationModule {}
