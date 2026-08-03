import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BiService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboards ──

  async findAllDashboards(companyId: string) {
    return this.prisma.dashboard.findMany({
      where: { companyId },
      include: { _count: { select: { widgets: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDashboard(companyId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, companyId },
      include: { widgets: { orderBy: { position: 'asc' } } },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async createDashboard(companyId: string, dto: any) {
    return this.prisma.dashboard.create({
      data: { ...dto, companyId },
    });
  }

  async updateDashboard(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.dashboard.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Dashboard not found');
    return this.prisma.dashboard.update({ where: { id }, data: dto });
  }

  async removeDashboard(companyId: string, id: string) {
    const existing = await this.prisma.dashboard.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Dashboard not found');
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async saveLayout(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.dashboard.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Dashboard not found');
    return this.prisma.dashboard.update({ where: { id }, data: { layout: dto.layout ?? dto } });
  }

  async addWidget(companyId: string, dashboardId: string, dto: any) {
    const dashboard = await this.prisma.dashboard.findFirst({ where: { id: dashboardId, companyId } });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return this.prisma.dashboardWidget.create({
      data: { ...dto, dashboardId, companyId },
    });
  }

  async updateWidget(companyId: string, dashboardId: string, widgetId: string, dto: any) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id: widgetId, dashboardId, companyId },
    });
    if (!widget) throw new NotFoundException('Widget not found');
    return this.prisma.dashboardWidget.update({ where: { id: widgetId }, data: dto });
  }

  async removeWidget(companyId: string, dashboardId: string, widgetId: string) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id: widgetId, dashboardId, companyId },
    });
    if (!widget) throw new NotFoundException('Widget not found');
    return this.prisma.dashboardWidget.delete({ where: { id: widgetId } });
  }

  // ── Reports ──

  async findAllReports(companyId: string) {
    return this.prisma.report.findMany({
      where: { companyId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReport(companyId: string, id: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId },
      include: { schedules: true, creator: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async createReport(companyId: string, userId: string, dto: any) {
    return this.prisma.report.create({
      data: { ...dto, companyId, createdBy: userId },
    });
  }

  async updateReport(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.report.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Report not found');
    return this.prisma.report.update({ where: { id }, data: dto });
  }

  async removeReport(companyId: string, id: string) {
    const existing = await this.prisma.report.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Report not found');
    return this.prisma.report.delete({ where: { id } });
  }

  async addSchedule(companyId: string, reportId: string, dto: any) {
    const report = await this.prisma.report.findFirst({ where: { id: reportId, companyId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.reportSchedule.create({
      data: { ...dto, reportId, companyId },
    });
  }

  async removeSchedule(companyId: string, reportId: string, scheduleId: string) {
    const schedule = await this.prisma.reportSchedule.findFirst({
      where: { id: scheduleId, reportId, companyId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return this.prisma.reportSchedule.delete({ where: { id: scheduleId } });
  }

  async exportReport(companyId: string, id: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId },
    });
    if (!report) throw new NotFoundException('Report not found');
    return { report, data: [], message: 'Report data ready for PDF/Excel generation' };
  }

  // ── Saved Filters ──

  async findAllFilters(userId: string) {
    return this.prisma.savedFilter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFilter(companyId: string, userId: string, dto: any) {
    return this.prisma.savedFilter.create({
      data: { ...dto, userId, companyId },
    });
  }

  async removeFilter(userId: string, id: string) {
    const filter = await this.prisma.savedFilter.findFirst({
      where: { id, userId },
    });
    if (!filter) throw new NotFoundException('Filter not found');
    return this.prisma.savedFilter.delete({ where: { id } });
  }

  // ── KPIs / Metrics ──

  async getKpis(companyId: string) {
    const revenue = await this.prisma.invoice.aggregate({
      where: { companyId, status: 'POSTED' },
      _sum: { total: true },
    });

    const salesOrders = await this.prisma.salesOrder.count({
      where: { companyId },
    });

    const customers = await this.prisma.customer.count({
      where: { companyId },
    });

    const products = await this.prisma.product.count({
      where: { companyId },
    });

    const activeEmployees = await this.prisma.employee.count({
      where: { companyId, isActive: true },
    });

    const pendingApprovals = await this.prisma.approval.count({
      where: { companyId, status: 'PENDING' },
    });

    const inventoryValue = await this.prisma.$queryRaw<
      { value: number }[]
    >`SELECT COALESCE(SUM(i.quantity * p.cost), 0) as value FROM erp.inventories i JOIN erp.products p ON p.id = i.product_id WHERE i.company_id = ${companyId}::uuid`;

    return {
      revenue: revenue._sum.total,
      salesOrders,
      customers,
      products,
      activeEmployees,
      pendingApprovals,
      inventoryValue: inventoryValue[0]?.value ?? 0,
    };
  }
}
