/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `currencies` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "erp"."AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'CONTINGENT', 'ORDER');

-- CreateEnum
CREATE TYPE "erp"."JournalEntryStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."PeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');

-- CreateEnum
CREATE TYPE "erp"."DocumentType" AS ENUM ('INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PAYMENT', 'RECEIPT', 'PURCHASE_ORDER', 'SALES_ORDER');

-- CreateEnum
CREATE TYPE "erp"."DocumentStatus" AS ENUM ('DRAFT', 'APPROVED', 'POSTED', 'CANCELLED', 'VOID');

-- CreateEnum
CREATE TYPE "erp"."PaymentMethod" AS ENUM ('CASH', 'CHECK', 'TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'ELECTRONIC', 'OTHER');

-- CreateEnum
CREATE TYPE "erp"."PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'GOVERNMENT');

-- DropIndex
DROP INDEX "erp"."currencies_company_id_code_key";

-- DropIndex
DROP INDEX "erp"."taxes_company_id_name_key";

-- CreateTable
CREATE TABLE "erp"."accounts" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "erp"."AccountType" NOT NULL,
    "nature" INTEGER NOT NULL DEFAULT 1,
    "level" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_leaf" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "parent_id" UUID,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."cost_centers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."cost_center_budgets" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cost_center_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "cost_center_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."accounting_periods" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "erp"."PeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closed_at" TIMESTAMP(3),
    "closed_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "accounting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."journal_entries" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference" VARCHAR(255),
    "status" "erp"."JournalEntryStatus" NOT NULL DEFAULT 'DRAFT',
    "total_debit" DECIMAL(15,2) NOT NULL,
    "total_credit" DECIMAL(15,2) NOT NULL,
    "posted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "accounting_period_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."journal_entry_lines" (
    "id" UUID NOT NULL,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journal_entry_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "cost_center_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."document_sequences" (
    "id" UUID NOT NULL,
    "documentType" "erp"."DocumentType" NOT NULL,
    "prefix" VARCHAR(20) NOT NULL,
    "next_number" INTEGER NOT NULL DEFAULT 1,
    "length" INTEGER NOT NULL DEFAULT 8,
    "mask" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."customers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "tax_id" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "customer_type" "erp"."CustomerType" NOT NULL DEFAULT 'COMPANY',
    "credit_limit" DECIMAL(15,2) DEFAULT 0,
    "credit_days" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "company_id" UUID NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."suppliers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "tax_id" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "credit_days" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "company_id" UUID NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."invoices" (
    "id" UUID NOT NULL,
    "document_number" VARCHAR(100) NOT NULL,
    "documentType" "erp"."DocumentType" NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "currency_code" VARCHAR(3) NOT NULL DEFAULT 'MXN',
    "exchange_rate" DECIMAL(15,6) NOT NULL DEFAULT 1,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(15,2) NOT NULL,
    "status" "erp"."DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "payment_status" "erp"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" "erp"."PaymentMethod",
    "notes" TEXT,
    "fiscal_folio" VARCHAR(100),
    "fiscal_xml" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "customer_id" UUID,
    "supplier_id" UUID,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."invoice_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,4) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."invoice_taxes" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "base" DECIMAL(15,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_id" UUID NOT NULL,
    "tax_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "invoice_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."payments" (
    "id" UUID NOT NULL,
    "payment_number" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" "erp"."PaymentMethod" NOT NULL,
    "reference" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "customer_id" UUID,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_company_id_type_idx" ON "erp"."accounts"("company_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_company_id_code_key" ON "erp"."accounts"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_company_id_code_key" ON "erp"."cost_centers"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "cost_center_budgets_cost_center_id_account_id_year_key" ON "erp"."cost_center_budgets"("cost_center_id", "account_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_company_id_year_month_key" ON "erp"."accounting_periods"("company_id", "year", "month");

-- CreateIndex
CREATE INDEX "journal_entries_company_id_status_created_at_idx" ON "erp"."journal_entries"("company_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_company_id_number_key" ON "erp"."journal_entries"("company_id", "number");

-- CreateIndex
CREATE INDEX "journal_entry_lines_journal_entry_id_idx" ON "erp"."journal_entry_lines"("journal_entry_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_account_id_idx" ON "erp"."journal_entry_lines"("account_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_company_id_account_id_created_at_idx" ON "erp"."journal_entry_lines"("company_id", "account_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequences_company_id_documentType_key" ON "erp"."document_sequences"("company_id", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_code_key" ON "erp"."customers"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_tax_id_key" ON "erp"."customers"("company_id", "tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_company_id_code_key" ON "erp"."suppliers"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_company_id_tax_id_key" ON "erp"."suppliers"("company_id", "tax_id");

-- CreateIndex
CREATE INDEX "invoices_company_id_document_number_idx" ON "erp"."invoices"("company_id", "document_number");

-- CreateIndex
CREATE INDEX "invoices_company_id_customer_id_idx" ON "erp"."invoices"("company_id", "customer_id");

-- CreateIndex
CREATE INDEX "invoices_company_id_issue_date_idx" ON "erp"."invoices"("company_id", "issue_date");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "erp"."currencies"("code");

-- AddForeignKey
ALTER TABLE "erp"."accounts" ADD CONSTRAINT "accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."accounts" ADD CONSTRAINT "accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "erp"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."cost_centers" ADD CONSTRAINT "cost_centers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."cost_center_budgets" ADD CONSTRAINT "cost_center_budgets_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "erp"."cost_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."cost_center_budgets" ADD CONSTRAINT "cost_center_budgets_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "erp"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."cost_center_budgets" ADD CONSTRAINT "cost_center_budgets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."accounting_periods" ADD CONSTRAINT "accounting_periods_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entries" ADD CONSTRAINT "journal_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entries" ADD CONSTRAINT "journal_entries_accounting_period_id_fkey" FOREIGN KEY ("accounting_period_id") REFERENCES "erp"."accounting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entries" ADD CONSTRAINT "journal_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "erp"."journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "erp"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "erp"."cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."document_sequences" ADD CONSTRAINT "document_sequences_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "erp"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoices" ADD CONSTRAINT "invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "erp"."suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "erp"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoice_lines" ADD CONSTRAINT "invoice_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoice_taxes" ADD CONSTRAINT "invoice_taxes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "erp"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoice_taxes" ADD CONSTRAINT "invoice_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "erp"."taxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."invoice_taxes" ADD CONSTRAINT "invoice_taxes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payments" ADD CONSTRAINT "payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "erp"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "erp"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
