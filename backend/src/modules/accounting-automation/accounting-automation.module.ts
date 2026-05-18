import { Module } from '@nestjs/common';
import { AccountingAutomationController } from './accounting-automation.controller';
import { AccountingAutomationService } from './accounting-automation.service';

@Module({
  controllers: [AccountingAutomationController],
  providers: [AccountingAutomationService],
  exports: [AccountingAutomationService],
})
export class AccountingAutomationModule {}
