import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './database/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { InvoicingModule } from './modules/invoicing/invoicing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuditModule } from './modules/audit/audit.module';
import { EmailModule } from './modules/email/email.module';
import { FinancialReportsModule } from './modules/financial-reports/financial-reports.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { CostCentersModule } from './modules/cost-centers/cost-centers.module';
import { AccountingPeriodsModule } from './modules/accounting-periods/accounting-periods.module';
import { DocumentSequencesModule } from './modules/document-sequences/document-sequences.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AccountingAutomationModule } from './modules/accounting-automation/accounting-automation.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { CurrencyRevaluationModule } from './modules/currency-revaluation/currency-revaluation.module';
import { CrmModule } from './modules/crm/crm.module';
import { SalesModule } from './modules/sales/sales.module';
import { PosModule } from './modules/pos/pos.module';
import { PurchasingModule } from './modules/purchasing/purchasing.module';
import { ProductsModule } from './modules/products/products.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { KardexModule } from './modules/kardex/kardex.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { CostingModule } from './modules/costing/costing.module';
import { PickingModule } from './modules/picking/picking.module';
import { LogisticsDashboardModule } from './modules/logistics-dashboard/logistics-dashboard.module';
import { EventModule } from './events/event.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    RedisModule,
    EventModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    BranchesModule,
    CurrenciesModule,
    TaxesModule,
    WarehousesModule,
    PermissionsModule,
    InvoicingModule,
    PaymentsModule,
    AuditModule,
    EmailModule,
    FinancialReportsModule,
    AccountingModule,
    CostCentersModule,
    AccountingPeriodsModule,
    DocumentSequencesModule,
    CustomersModule,
    SuppliersModule,
    AccountingAutomationModule,
    ExchangeRatesModule,
    CurrencyRevaluationModule,
    CrmModule,
    SalesModule,
    PosModule,
    PurchasingModule,
    ProductsModule,
    AutomationsModule,
    InventoryModule,
    KardexModule,
    TransfersModule,
    CostingModule,
    PickingModule,
    LogisticsDashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
