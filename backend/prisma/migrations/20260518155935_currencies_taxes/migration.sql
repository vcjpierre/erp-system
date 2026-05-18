/*
  Warnings:

  - A unique constraint covering the columns `[company_id,code]` on the table `currencies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,name]` on the table `taxes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "erp"."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "erp"."ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'FOLLOW_UP', 'VISIT');

-- CreateEnum
CREATE TYPE "erp"."SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "erp"."PosSessionStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."PurchaseRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."PurchaseOrderStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'SENT', 'CONFIRMED', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."ReceivingStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."BusinessRuleTrigger" AS ENUM ('ON_CREATE', 'ON_UPDATE', 'ON_DELETE', 'ON_STATUS_CHANGE', 'ON_APPROVAL', 'SCHEDULED');

-- DropIndex
DROP INDEX "erp"."currencies_code_key";

-- AlterTable
ALTER TABLE "erp"."accounts" ADD COLUMN     "monetary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "erp"."invoices" ADD COLUMN     "subscription_id" UUID;

-- AlterTable
ALTER TABLE "erp"."taxes" ALTER COLUMN "is_active" SET DEFAULT false;

-- CreateTable
CREATE TABLE "erp"."exchange_rates" (
    "id" UUID NOT NULL,
    "rate" DECIMAL(15,6) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency_id" UUID NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."currency_revaluations" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "total_gain_loss" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "accounting_period_id" UUID NOT NULL,

    CONSTRAINT "currency_revaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."currency_revaluation_lines" (
    "id" UUID NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL,
    "previous_rate" DECIMAL(15,6) NOT NULL,
    "current_rate" DECIMAL(15,6) NOT NULL,
    "balance_before" DECIMAL(15,2) NOT NULL,
    "balance_after" DECIMAL(15,2) NOT NULL,
    "gain_loss" DECIMAL(15,2) NOT NULL,
    "revaluation_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "currency_revaluation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pipelines" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pipeline_stages" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "probability" INTEGER NOT NULL DEFAULT 50,
    "color" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pipeline_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."leads" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "company_name" VARCHAR(255),
    "position" VARCHAR(100),
    "source" VARCHAR(100),
    "status" "erp"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "converted_at" TIMESTAMP(3),
    "converted_to" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "assigned_to" UUID,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."deals" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 50,
    "expected_close" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "pipeline_stage_id" UUID,
    "lead_id" UUID,
    "assigned_to" UUID,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."activities" (
    "id" UUID NOT NULL,
    "type" "erp"."ActivityType" NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "lead_id" UUID,
    "deal_id" UUID,
    "customer_id" UUID,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."follow_ups" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,
    "assigned_to" UUID NOT NULL,
    "lead_id" UUID,
    "deal_id" UUID,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."quotes" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "status" "erp"."DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "converted_to_invoice_id" UUID,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."quote_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,4) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quote_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "quote_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."quote_taxes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "base" DECIMAL(15,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quote_id" UUID NOT NULL,
    "tax_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "quote_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."sales_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "status" "erp"."DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "quote_id" UUID,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."sales_order_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,4) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sales_order_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "sales_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."sales_targets" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'REVENUE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "sales_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."commissions" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "basis_amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "settled_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "invoice_id" UUID,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."subscriptions" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "billing_cycle" VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    "billing_day" INTEGER NOT NULL DEFAULT 1,
    "status" "erp"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."subscription_lines" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "subscription_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pos_sessions" (
    "id" UUID NOT NULL,
    "opening_date" TIMESTAMP(3) NOT NULL,
    "closing_date" TIMESTAMP(3),
    "initial_cash" DECIMAL(15,2) NOT NULL,
    "final_cash" DECIMAL(15,2),
    "total_sales" DECIMAL(15,2),
    "status" "erp"."PosSessionStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "opened_by" UUID NOT NULL,
    "closed_by" UUID,

    CONSTRAINT "pos_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pos_movements" (
    "id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "reference" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "payment_id" UUID,

    CONSTRAINT "pos_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."purchase_requests" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "erp"."PurchaseRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."purchase_request_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "estimated_price" DECIMAL(15,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchase_request_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "purchase_request_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."purchase_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expected_date" TIMESTAMP(3),
    "subtotal" DECIMAL(15,2) NOT NULL,
    "tax_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "status" "erp"."PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "purchase_request_id" UUID,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."purchase_order_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,4) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "received_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchase_order_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."receivings" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL,
    "status" "erp"."ReceivingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,

    CONSTRAINT "receivings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."receiving_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiving_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "receiving_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."import_costs" (
    "id" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'MXN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,

    CONSTRAINT "import_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."supplier_price_histories" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,

    CONSTRAINT "supplier_price_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."supplier_evaluations" (
    "id" UUID NOT NULL,
    "quality" INTEGER NOT NULL DEFAULT 5,
    "price" INTEGER NOT NULL DEFAULT 5,
    "delivery" INTEGER NOT NULL DEFAULT 5,
    "service" INTEGER NOT NULL DEFAULT 5,
    "total_score" DECIMAL(5,2) NOT NULL,
    "comments" TEXT,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,

    CONSTRAINT "supplier_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."products" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'pza',
    "price" DECIMAL(15,2) NOT NULL,
    "cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."inventories" (
    "id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "min_stock" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "max_stock" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."price_lists" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'SALE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."approvals" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "status" "erp"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approver_id" UUID NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."business_rules" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "trigger" "erp"."BusinessRuleTrigger" NOT NULL,
    "condition" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "business_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."business_rule_actions" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "business_rule_id" UUID NOT NULL,

    CONSTRAINT "business_rule_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."ecommerce_syncs" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "ecommerce_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rates_currency_id_date_idx" ON "erp"."exchange_rates"("currency_id", "date");

-- CreateIndex
CREATE INDEX "currency_revaluations_company_id_created_at_idx" ON "erp"."currency_revaluations"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "currency_revaluation_lines_revaluation_id_idx" ON "erp"."currency_revaluation_lines"("revaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "pipelines_company_id_name_key" ON "erp"."pipelines"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stages_pipeline_id_name_key" ON "erp"."pipeline_stages"("pipeline_id", "name");

-- CreateIndex
CREATE INDEX "leads_company_id_status_idx" ON "erp"."leads"("company_id", "status");

-- CreateIndex
CREATE INDEX "deals_company_id_pipeline_stage_id_idx" ON "erp"."deals"("company_id", "pipeline_stage_id");

-- CreateIndex
CREATE INDEX "activities_company_id_due_date_idx" ON "erp"."activities"("company_id", "due_date");

-- CreateIndex
CREATE INDEX "follow_ups_company_id_date_idx" ON "erp"."follow_ups"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_company_id_number_key" ON "erp"."quotes"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_company_id_number_key" ON "erp"."sales_orders"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_targets_company_id_user_id_year_month_type_key" ON "erp"."sales_targets"("company_id", "user_id", "year", "month", "type");

-- CreateIndex
CREATE INDEX "commissions_company_id_user_id_idx" ON "erp"."commissions"("company_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_company_id_number_key" ON "erp"."subscriptions"("company_id", "number");

-- CreateIndex
CREATE INDEX "pos_sessions_company_id_status_idx" ON "erp"."pos_sessions"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_company_id_number_key" ON "erp"."purchase_requests"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_company_id_number_key" ON "erp"."purchase_orders"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "receivings_company_id_number_key" ON "erp"."receivings"("company_id", "number");

-- CreateIndex
CREATE INDEX "supplier_price_histories_supplier_id_date_idx" ON "erp"."supplier_price_histories"("supplier_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_code_key" ON "erp"."products"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_product_id_warehouse_id_key" ON "erp"."inventories"("product_id", "warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_company_id_name_key" ON "erp"."price_lists"("company_id", "name");

-- CreateIndex
CREATE INDEX "approvals_company_id_entity_type_entity_id_idx" ON "erp"."approvals"("company_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "ecommerce_syncs_company_id_entity_type_status_idx" ON "erp"."ecommerce_syncs"("company_id", "entity_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_company_id_code_key" ON "erp"."currencies"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "taxes_company_id_name_key" ON "erp"."taxes"("company_id", "name");

-- AddForeignKey
ALTER TABLE "erp"."exchange_rates" ADD CONSTRAINT "exchange_rates_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "erp"."currencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."currency_revaluations" ADD CONSTRAINT "currency_revaluations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."currency_revaluations" ADD CONSTRAINT "currency_revaluations_accounting_period_id_fkey" FOREIGN KEY ("accounting_period_id") REFERENCES "erp"."accounting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."currency_revaluation_lines" ADD CONSTRAINT "currency_revaluation_lines_revaluation_id_fkey" FOREIGN KEY ("revaluation_id") REFERENCES "erp"."currency_revaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."currency_revaluation_lines" ADD CONSTRAINT "currency_revaluation_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "erp"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."currency_revaluation_lines" ADD CONSTRAINT "currency_revaluation_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "erp"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pipelines" ADD CONSTRAINT "pipelines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "erp"."pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pipeline_stages" ADD CONSTRAINT "pipeline_stages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "erp"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."deals" ADD CONSTRAINT "deals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."deals" ADD CONSTRAINT "deals_pipeline_stage_id_fkey" FOREIGN KEY ("pipeline_stage_id") REFERENCES "erp"."pipeline_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."deals" ADD CONSTRAINT "deals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "erp"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."deals" ADD CONSTRAINT "deals_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "erp"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."activities" ADD CONSTRAINT "activities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."activities" ADD CONSTRAINT "activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."activities" ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "erp"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."activities" ADD CONSTRAINT "activities_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "erp"."deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."activities" ADD CONSTRAINT "activities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "erp"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."follow_ups" ADD CONSTRAINT "follow_ups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."follow_ups" ADD CONSTRAINT "follow_ups_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."follow_ups" ADD CONSTRAINT "follow_ups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "erp"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."follow_ups" ADD CONSTRAINT "follow_ups_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "erp"."deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quotes" ADD CONSTRAINT "quotes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quotes" ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "erp"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quotes" ADD CONSTRAINT "quotes_converted_to_invoice_id_fkey" FOREIGN KEY ("converted_to_invoice_id") REFERENCES "erp"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quote_lines" ADD CONSTRAINT "quote_lines_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "erp"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quote_lines" ADD CONSTRAINT "quote_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quote_taxes" ADD CONSTRAINT "quote_taxes_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "erp"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quote_taxes" ADD CONSTRAINT "quote_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "erp"."taxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."quote_taxes" ADD CONSTRAINT "quote_taxes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_orders" ADD CONSTRAINT "sales_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "erp"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_orders" ADD CONSTRAINT "sales_orders_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "erp"."quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_order_lines" ADD CONSTRAINT "sales_order_lines_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "erp"."sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_order_lines" ADD CONSTRAINT "sales_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_targets" ADD CONSTRAINT "sales_targets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."sales_targets" ADD CONSTRAINT "sales_targets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."commissions" ADD CONSTRAINT "commissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."commissions" ADD CONSTRAINT "commissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."commissions" ADD CONSTRAINT "commissions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "erp"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."subscriptions" ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."subscriptions" ADD CONSTRAINT "subscriptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "erp"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."subscription_lines" ADD CONSTRAINT "subscription_lines_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "erp"."subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."subscription_lines" ADD CONSTRAINT "subscription_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pos_sessions" ADD CONSTRAINT "pos_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pos_sessions" ADD CONSTRAINT "pos_sessions_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pos_sessions" ADD CONSTRAINT "pos_sessions_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "erp"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pos_movements" ADD CONSTRAINT "pos_movements_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "erp"."pos_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pos_movements" ADD CONSTRAINT "pos_movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pos_movements" ADD CONSTRAINT "pos_movements_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "erp"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_requests" ADD CONSTRAINT "purchase_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_requests" ADD CONSTRAINT "purchase_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_requests" ADD CONSTRAINT "purchase_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "erp"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_request_lines" ADD CONSTRAINT "purchase_request_lines_purchase_request_id_fkey" FOREIGN KEY ("purchase_request_id") REFERENCES "erp"."purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_request_lines" ADD CONSTRAINT "purchase_request_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_orders" ADD CONSTRAINT "purchase_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "erp"."suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_orders" ADD CONSTRAINT "purchase_orders_purchase_request_id_fkey" FOREIGN KEY ("purchase_request_id") REFERENCES "erp"."purchase_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "erp"."purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."receivings" ADD CONSTRAINT "receivings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."receivings" ADD CONSTRAINT "receivings_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "erp"."purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."receiving_lines" ADD CONSTRAINT "receiving_lines_receiving_id_fkey" FOREIGN KEY ("receiving_id") REFERENCES "erp"."receivings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."receiving_lines" ADD CONSTRAINT "receiving_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."import_costs" ADD CONSTRAINT "import_costs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."import_costs" ADD CONSTRAINT "import_costs_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "erp"."purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."supplier_price_histories" ADD CONSTRAINT "supplier_price_histories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."supplier_price_histories" ADD CONSTRAINT "supplier_price_histories_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "erp"."suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."supplier_evaluations" ADD CONSTRAINT "supplier_evaluations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."supplier_evaluations" ADD CONSTRAINT "supplier_evaluations_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "erp"."suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventories" ADD CONSTRAINT "inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventories" ADD CONSTRAINT "inventories_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventories" ADD CONSTRAINT "inventories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."price_lists" ADD CONSTRAINT "price_lists_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."approvals" ADD CONSTRAINT "approvals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."approvals" ADD CONSTRAINT "approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."approvals" ADD CONSTRAINT "approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."business_rules" ADD CONSTRAINT "business_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."business_rule_actions" ADD CONSTRAINT "business_rule_actions_business_rule_id_fkey" FOREIGN KEY ("business_rule_id") REFERENCES "erp"."business_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."ecommerce_syncs" ADD CONSTRAINT "ecommerce_syncs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
