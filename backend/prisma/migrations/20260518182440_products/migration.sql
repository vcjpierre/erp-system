/*
  Warnings:

  - A unique constraint covering the columns `[company_id,barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "erp"."CostingMethod" AS ENUM ('FIFO', 'LIFO', 'WEIGHTED_AVERAGE', 'STANDARD');

-- CreateEnum
CREATE TYPE "erp"."MovementType" AS ENUM ('PURCHASE_RECEIPT', 'SALES_ISSUE', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'INITIAL_BALANCE', 'PRODUCTION_ISSUE', 'PRODUCTION_RECEIPT', 'RETURN_IN', 'RETURN_OUT', 'PICKING', 'PACKING', 'DISPATCH');

-- CreateEnum
CREATE TYPE "erp"."TransferStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."InventoryAdjustmentType" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "erp"."PhysicalCountStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."PickStatus" AS ENUM ('PENDING', 'PICKING', 'PICKED', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."PackStatus" AS ENUM ('PENDING', 'PACKING', 'PACKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."DispatchStatus" AS ENUM ('PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "erp"."inventories" ADD COLUMN     "available_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "location_id" UUID,
ADD COLUMN     "lot_id" UUID,
ADD COLUMN     "reserved_qty" DECIMAL(15,4) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "erp"."products" ADD COLUMN     "barcode" VARCHAR(100),
ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "costing_method" "erp"."CostingMethod" NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
ADD COLUMN     "image" VARCHAR(500),
ADD COLUMN     "track_expiry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "track_lot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "track_serial" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "erp"."warehouse_locations" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "barcode" VARCHAR(100),
    "aisle" VARCHAR(50),
    "rack" VARCHAR(50),
    "shelf" VARCHAR(50),
    "bin" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "parent_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "warehouse_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."inventory_lots" (
    "id" UUID NOT NULL,
    "lot_number" VARCHAR(100) NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "expiry_date" TIMESTAMP(3),
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "inventory_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."inventory_serials" (
    "id" UUID NOT NULL,
    "serial_number" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sold_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "inventory_serials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."inventory_transactions" (
    "id" UUID NOT NULL,
    "movement_type" "erp"."MovementType" NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "reference" VARCHAR(255),
    "reference_id" VARCHAR(100),
    "notes" TEXT,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "location_id" UUID,
    "lot_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."transfer_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "erp"."TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "transferred_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "from_warehouse_id" UUID NOT NULL,
    "to_warehouse_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "transfer_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."transfer_order_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "transferred_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "received_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transfer_order_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "transfer_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."inventory_adjustments" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "erp"."InventoryAdjustmentType" NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "posted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."inventory_adjustment_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adjustment_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "location_id" UUID,
    "lot_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "inventory_adjustment_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."physical_counts" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "erp"."PhysicalCountStatus" NOT NULL DEFAULT 'DRAFT',
    "count_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "physical_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."physical_count_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "expected_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "counted_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "difference_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "physical_count_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "location_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "physical_count_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."valuation_layers" (
    "id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "remaining_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "layer_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "layer_type" VARCHAR(20) NOT NULL DEFAULT 'PURCHASE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "valuation_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pick_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "erp"."PickStatus" NOT NULL DEFAULT 'PENDING',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    "picked_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "assigned_to" UUID,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "pick_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pick_order_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "picked_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pick_order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "location_id" UUID,
    "lot_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "pick_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pack_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "erp"."PackStatus" NOT NULL DEFAULT 'PENDING',
    "packed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "pick_order_id" UUID,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "pack_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."pack_order_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "packed_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pack_order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "pack_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."dispatch_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "erp"."DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "dispatched_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "recipient_name" VARCHAR(255),
    "delivery_address" TEXT,
    "tracking_number" VARCHAR(100),
    "carrier" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "pack_order_id" UUID,
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "dispatch_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."dispatch_order_lines" (
    "id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "dispatched_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatch_order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "dispatch_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_locations_warehouse_id_code_key" ON "erp"."warehouse_locations"("warehouse_id", "code");

-- CreateIndex
CREATE INDEX "inventory_lots_product_id_expiry_date_idx" ON "erp"."inventory_lots"("product_id", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_lots_product_id_lot_number_key" ON "erp"."inventory_lots"("product_id", "lot_number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_serials_product_id_serial_number_key" ON "erp"."inventory_serials"("product_id", "serial_number");

-- CreateIndex
CREATE INDEX "inventory_transactions_product_id_warehouse_id_moved_at_idx" ON "erp"."inventory_transactions"("product_id", "warehouse_id", "moved_at");

-- CreateIndex
CREATE INDEX "inventory_transactions_reference_id_idx" ON "erp"."inventory_transactions"("reference_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_company_id_moved_at_idx" ON "erp"."inventory_transactions"("company_id", "moved_at");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_orders_company_id_number_key" ON "erp"."transfer_orders"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_adjustments_company_id_number_key" ON "erp"."inventory_adjustments"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "physical_counts_company_id_number_key" ON "erp"."physical_counts"("company_id", "number");

-- CreateIndex
CREATE INDEX "valuation_layers_product_id_warehouse_id_layer_date_idx" ON "erp"."valuation_layers"("product_id", "warehouse_id", "layer_date");

-- CreateIndex
CREATE INDEX "valuation_layers_remaining_qty_idx" ON "erp"."valuation_layers"("remaining_qty");

-- CreateIndex
CREATE UNIQUE INDEX "pick_orders_company_id_number_key" ON "erp"."pick_orders"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "pack_orders_company_id_number_key" ON "erp"."pack_orders"("company_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_orders_company_id_number_key" ON "erp"."dispatch_orders"("company_id", "number");

-- CreateIndex
CREATE INDEX "inventories_warehouse_id_location_id_idx" ON "erp"."inventories"("warehouse_id", "location_id");

-- CreateIndex
CREATE INDEX "inventories_product_id_lot_id_idx" ON "erp"."inventories"("product_id", "lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_barcode_key" ON "erp"."products"("company_id", "barcode");

-- AddForeignKey
ALTER TABLE "erp"."inventories" ADD CONSTRAINT "inventories_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "erp"."warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventories" ADD CONSTRAINT "inventories_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "erp"."inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."warehouse_locations" ADD CONSTRAINT "warehouse_locations_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."warehouse_locations" ADD CONSTRAINT "warehouse_locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "erp"."warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."warehouse_locations" ADD CONSTRAINT "warehouse_locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_lots" ADD CONSTRAINT "inventory_lots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_lots" ADD CONSTRAINT "inventory_lots_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_serials" ADD CONSTRAINT "inventory_serials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_serials" ADD CONSTRAINT "inventory_serials_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "erp"."warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "erp"."inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."transfer_orders" ADD CONSTRAINT "transfer_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."transfer_orders" ADD CONSTRAINT "transfer_orders_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."transfer_orders" ADD CONSTRAINT "transfer_orders_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."transfer_orders" ADD CONSTRAINT "transfer_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."transfer_order_lines" ADD CONSTRAINT "transfer_order_lines_transfer_order_id_fkey" FOREIGN KEY ("transfer_order_id") REFERENCES "erp"."transfer_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."transfer_order_lines" ADD CONSTRAINT "transfer_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "erp"."inventory_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "erp"."warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "erp"."inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_counts" ADD CONSTRAINT "physical_counts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_counts" ADD CONSTRAINT "physical_counts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_counts" ADD CONSTRAINT "physical_counts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_count_lines" ADD CONSTRAINT "physical_count_lines_physical_count_id_fkey" FOREIGN KEY ("physical_count_id") REFERENCES "erp"."physical_counts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_count_lines" ADD CONSTRAINT "physical_count_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_count_lines" ADD CONSTRAINT "physical_count_lines_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "erp"."warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."physical_count_lines" ADD CONSTRAINT "physical_count_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."valuation_layers" ADD CONSTRAINT "valuation_layers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."valuation_layers" ADD CONSTRAINT "valuation_layers_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."valuation_layers" ADD CONSTRAINT "valuation_layers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_orders" ADD CONSTRAINT "pick_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_orders" ADD CONSTRAINT "pick_orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "erp"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_orders" ADD CONSTRAINT "pick_orders_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "erp"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_orders" ADD CONSTRAINT "pick_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_order_lines" ADD CONSTRAINT "pick_order_lines_pick_order_id_fkey" FOREIGN KEY ("pick_order_id") REFERENCES "erp"."pick_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_order_lines" ADD CONSTRAINT "pick_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_order_lines" ADD CONSTRAINT "pick_order_lines_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "erp"."warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_order_lines" ADD CONSTRAINT "pick_order_lines_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "erp"."inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pick_order_lines" ADD CONSTRAINT "pick_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pack_orders" ADD CONSTRAINT "pack_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pack_orders" ADD CONSTRAINT "pack_orders_pick_order_id_fkey" FOREIGN KEY ("pick_order_id") REFERENCES "erp"."pick_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pack_orders" ADD CONSTRAINT "pack_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pack_order_lines" ADD CONSTRAINT "pack_order_lines_pack_order_id_fkey" FOREIGN KEY ("pack_order_id") REFERENCES "erp"."pack_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pack_order_lines" ADD CONSTRAINT "pack_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."pack_order_lines" ADD CONSTRAINT "pack_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dispatch_orders" ADD CONSTRAINT "dispatch_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dispatch_orders" ADD CONSTRAINT "dispatch_orders_pack_order_id_fkey" FOREIGN KEY ("pack_order_id") REFERENCES "erp"."pack_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dispatch_orders" ADD CONSTRAINT "dispatch_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dispatch_order_lines" ADD CONSTRAINT "dispatch_order_lines_dispatch_order_id_fkey" FOREIGN KEY ("dispatch_order_id") REFERENCES "erp"."dispatch_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dispatch_order_lines" ADD CONSTRAINT "dispatch_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dispatch_order_lines" ADD CONSTRAINT "dispatch_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
