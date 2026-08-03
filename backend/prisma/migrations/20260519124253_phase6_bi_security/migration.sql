-- CreateEnum
CREATE TYPE "erp"."ContractType" AS ENUM ('PERMANENT', 'TEMPORARY', 'CONTRACT', 'INTERNSHIP', 'PROBATION');

-- CreateEnum
CREATE TYPE "erp"."ContractStatus" AS ENUM ('ACTIVE', 'TERMINATED', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "erp"."LeaveType" AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "erp"."LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."PayrollStatus" AS ENUM ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."EvaluationStatus" AS ENUM ('DRAFT', 'PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "erp"."RecruitmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."CandidateStatus" AS ENUM ('NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "erp"."ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "erp"."ProductionOrderStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "erp"."departments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "parent_id" UUID,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."positions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "salary_min" DECIMAL(15,2),
    "salary_max" DECIMAL(15,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "department_id" UUID,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."employees" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "hire_date" TIMESTAMP(3) NOT NULL,
    "termination_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "base_salary" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "afp" VARCHAR(50),
    "afp_rate" DECIMAL(5,2) DEFAULT 0,
    "social_health_rate" DECIMAL(5,2) DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "user_id" UUID,
    "department_id" UUID,
    "position_id" UUID,
    "manager_id" UUID,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."contracts" (
    "id" UUID NOT NULL,
    "type" "erp"."ContractType" NOT NULL,
    "status" "erp"."ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "salary" DECIMAL(15,2) NOT NULL,
    "working_hours" INTEGER NOT NULL DEFAULT 40,
    "position" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."attendances" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "hours_worked" DECIMAL(5,2),
    "is_absent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."leaves" (
    "id" UUID NOT NULL,
    "type" "erp"."LeaveType" NOT NULL,
    "status" "erp"."LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."holidays" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" UUID NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."payrolls" (
    "id" UUID NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "status" "erp"."PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "total_salary" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_net" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."payroll_lines" (
    "id" UUID NOT NULL,
    "gross_salary" DECIMAL(15,2) NOT NULL,
    "deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_salary" DECIMAL(15,2) NOT NULL,
    "afp_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "social_health" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "income_tax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "bonuses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "overtime" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payroll_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "payroll_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."evaluations" (
    "id" UUID NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "score" INTEGER DEFAULT 0,
    "reviewer_notes" TEXT,
    "status" "erp"."EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "evaluated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "employee_id" UUID NOT NULL,
    "reviewer_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."recruitments" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "status" "erp"."RecruitmentStatus" NOT NULL DEFAULT 'DRAFT',
    "openings" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "position_id" UUID,

    CONSTRAINT "recruitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."candidates" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "cv" TEXT,
    "status" "erp"."CandidateStatus" NOT NULL DEFAULT 'NEW',
    "interview_notes" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "recruitment_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."trainings" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "hours" DECIMAL(5,2),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."dashboards" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "layout" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."dashboard_widgets" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "config" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 4,
    "height" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dashboard_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."reports" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB,
    "format" VARCHAR(20) NOT NULL DEFAULT 'TABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."report_schedules" (
    "id" UUID NOT NULL,
    "cron" VARCHAR(100) NOT NULL,
    "recipients" JSONB NOT NULL,
    "format" VARCHAR(10) NOT NULL DEFAULT 'PDF',
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "report_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "report_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."saved_filters" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "config" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."security_policies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "security_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."login_history" (
    "id" UUID NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failure_reason" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."projects" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "erp"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "budget_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,
    "manager_id" UUID,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."project_tasks" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "erp"."TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "estimated_hours" DECIMAL(8,2),
    "actual_hours" DECIMAL(8,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" UUID NOT NULL,
    "parent_id" UUID,
    "assignee_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."project_timesheets" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" UUID NOT NULL,
    "task_id" UUID,
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "project_timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."project_budgets" (
    "id" UUID NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "planned" DECIMAL(15,2) NOT NULL,
    "actual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "project_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."bill_of_materials" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "bill_of_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."bill_of_material_lines" (
    "id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "waste_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bom_id" UUID NOT NULL,
    "component_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "bill_of_material_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."work_centers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "capacity_hours" INTEGER NOT NULL DEFAULT 8,
    "efficiency" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "work_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."work_center_operations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "setup_time" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "run_time" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "work_center_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "work_center_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."production_orders" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "produced_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "erp"."ProductionOrderStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "bom_id" UUID,
    "company_id" UUID NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."production_order_lines" (
    "id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "production_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp"."mrp_recommendations" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "suggested_date" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "mrp_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_company_id_code_key" ON "erp"."departments"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "positions_company_id_code_key" ON "erp"."positions"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_company_id_code_key" ON "erp"."employees"("company_id", "code");

-- CreateIndex
CREATE INDEX "attendances_company_id_date_idx" ON "erp"."attendances"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employee_id_date_key" ON "erp"."attendances"("employee_id", "date");

-- CreateIndex
CREATE INDEX "leaves_company_id_employee_id_start_date_idx" ON "erp"."leaves"("company_id", "employee_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_company_id_date_key" ON "erp"."holidays"("company_id", "date");

-- CreateIndex
CREATE INDEX "payrolls_company_id_period_start_period_end_idx" ON "erp"."payrolls"("company_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_lines_payroll_id_employee_id_key" ON "erp"."payroll_lines"("payroll_id", "employee_id");

-- CreateIndex
CREATE INDEX "evaluations_company_id_employee_id_idx" ON "erp"."evaluations"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "candidates_recruitment_id_idx" ON "erp"."candidates"("recruitment_id");

-- CreateIndex
CREATE INDEX "trainings_company_id_employee_id_idx" ON "erp"."trainings"("company_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboards_company_id_name_key" ON "erp"."dashboards"("company_id", "name");

-- CreateIndex
CREATE INDEX "dashboard_widgets_dashboard_id_idx" ON "erp"."dashboard_widgets"("dashboard_id");

-- CreateIndex
CREATE INDEX "reports_company_id_type_idx" ON "erp"."reports"("company_id", "type");

-- CreateIndex
CREATE INDEX "report_schedules_report_id_idx" ON "erp"."report_schedules"("report_id");

-- CreateIndex
CREATE INDEX "saved_filters_company_id_entity_idx" ON "erp"."saved_filters"("company_id", "entity");

-- CreateIndex
CREATE UNIQUE INDEX "saved_filters_user_id_name_key" ON "erp"."saved_filters"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "security_policies_company_id_name_key" ON "erp"."security_policies"("company_id", "name");

-- CreateIndex
CREATE INDEX "login_history_user_id_created_at_idx" ON "erp"."login_history"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "login_history_company_id_created_at_idx" ON "erp"."login_history"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "projects_company_id_code_key" ON "erp"."projects"("company_id", "code");

-- CreateIndex
CREATE INDEX "project_tasks_project_id_status_idx" ON "erp"."project_tasks"("project_id", "status");

-- CreateIndex
CREATE INDEX "project_timesheets_project_id_date_idx" ON "erp"."project_timesheets"("project_id", "date");

-- CreateIndex
CREATE INDEX "project_timesheets_employee_id_date_idx" ON "erp"."project_timesheets"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "project_budgets_project_id_category_key" ON "erp"."project_budgets"("project_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "bill_of_materials_company_id_code_key" ON "erp"."bill_of_materials"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "work_centers_company_id_code_key" ON "erp"."work_centers"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_company_id_number_key" ON "erp"."production_orders"("company_id", "number");

-- CreateIndex
CREATE INDEX "mrp_recommendations_company_id_status_idx" ON "erp"."mrp_recommendations"("company_id", "status");

-- AddForeignKey
ALTER TABLE "erp"."departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "erp"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."positions" ADD CONSTRAINT "positions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."positions" ADD CONSTRAINT "positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "erp"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "erp"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "erp"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."employees" ADD CONSTRAINT "employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "erp"."positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."employees" ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "erp"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."contracts" ADD CONSTRAINT "contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."contracts" ADD CONSTRAINT "contracts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."attendances" ADD CONSTRAINT "attendances_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."leaves" ADD CONSTRAINT "leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."leaves" ADD CONSTRAINT "leaves_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."holidays" ADD CONSTRAINT "holidays_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payrolls" ADD CONSTRAINT "payrolls_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payroll_lines" ADD CONSTRAINT "payroll_lines_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "erp"."payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payroll_lines" ADD CONSTRAINT "payroll_lines_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."payroll_lines" ADD CONSTRAINT "payroll_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."evaluations" ADD CONSTRAINT "evaluations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."evaluations" ADD CONSTRAINT "evaluations_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "erp"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."evaluations" ADD CONSTRAINT "evaluations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."recruitments" ADD CONSTRAINT "recruitments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."recruitments" ADD CONSTRAINT "recruitments_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "erp"."positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."candidates" ADD CONSTRAINT "candidates_recruitment_id_fkey" FOREIGN KEY ("recruitment_id") REFERENCES "erp"."recruitments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."candidates" ADD CONSTRAINT "candidates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."trainings" ADD CONSTRAINT "trainings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."trainings" ADD CONSTRAINT "trainings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dashboards" ADD CONSTRAINT "dashboards_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "erp"."dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."reports" ADD CONSTRAINT "reports_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."reports" ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "erp"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."report_schedules" ADD CONSTRAINT "report_schedules_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "erp"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."report_schedules" ADD CONSTRAINT "report_schedules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."saved_filters" ADD CONSTRAINT "saved_filters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "erp"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."saved_filters" ADD CONSTRAINT "saved_filters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."security_policies" ADD CONSTRAINT "security_policies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "erp"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."login_history" ADD CONSTRAINT "login_history_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."projects" ADD CONSTRAINT "projects_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "erp"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "erp"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_tasks" ADD CONSTRAINT "project_tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "erp"."project_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_tasks" ADD CONSTRAINT "project_tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "erp"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_tasks" ADD CONSTRAINT "project_tasks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_timesheets" ADD CONSTRAINT "project_timesheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "erp"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_timesheets" ADD CONSTRAINT "project_timesheets_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "erp"."project_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_timesheets" ADD CONSTRAINT "project_timesheets_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "erp"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_timesheets" ADD CONSTRAINT "project_timesheets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_budgets" ADD CONSTRAINT "project_budgets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "erp"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."project_budgets" ADD CONSTRAINT "project_budgets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."bill_of_materials" ADD CONSTRAINT "bill_of_materials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."bill_of_materials" ADD CONSTRAINT "bill_of_materials_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."bill_of_material_lines" ADD CONSTRAINT "bill_of_material_lines_bom_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "erp"."bill_of_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."bill_of_material_lines" ADD CONSTRAINT "bill_of_material_lines_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."bill_of_material_lines" ADD CONSTRAINT "bill_of_material_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."work_centers" ADD CONSTRAINT "work_centers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."work_center_operations" ADD CONSTRAINT "work_center_operations_work_center_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "erp"."work_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."work_center_operations" ADD CONSTRAINT "work_center_operations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."production_orders" ADD CONSTRAINT "production_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."production_orders" ADD CONSTRAINT "production_orders_bom_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "erp"."bill_of_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."production_orders" ADD CONSTRAINT "production_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."production_order_lines" ADD CONSTRAINT "production_order_lines_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "erp"."production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."production_order_lines" ADD CONSTRAINT "production_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."production_order_lines" ADD CONSTRAINT "production_order_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."mrp_recommendations" ADD CONSTRAINT "mrp_recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "erp"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp"."mrp_recommendations" ADD CONSTRAINT "mrp_recommendations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "erp"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
