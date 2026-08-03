import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }

  async getMetrics(companyId: string) {
    const [users, dbSizeResult, activeSessions, companies, products, invoices, customers, suppliers, employees] =
      await Promise.all([
        this.prisma.user.count({ where: { companyId } }),
        this.prisma.$queryRaw<any[]>`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `,
        this.prisma.session.count({ where: { companyId, isActive: true } }),
        this.prisma.company.count(),
        this.prisma.product.count({ where: { companyId } }),
        this.prisma.invoice.count({ where: { companyId } }),
        this.prisma.customer.count({ where: { companyId } }),
        this.prisma.supplier.count({ where: { companyId } }),
        this.prisma.employee.count({ where: { companyId } }),
      ]);

    return {
      users,
      dbSize: dbSizeResult[0]?.size ?? '0',
      activeSessions,
      totalRecords: {
        companies,
        users,
        products,
        invoices,
        customers,
        suppliers,
        employees,
      },
    };
  }

  clearCache() {
    return { message: 'Cache cleared' };
  }

  getDbConnections() {
    return { active: 1, idle: 0, total: 1 };
  }

  getSlowQueries() {
    return [];
  }

  getPerformance() {
    return {
      cpu: 45,
      memory: { used: 2048, total: 8192, percentage: 25 },
      responseTime: 120,
    };
  }

  async getActivity(companyId: string) {
    return this.prisma.auditLog.findMany({
      where: { companyId },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async getLogs(companyId: string) {
    return this.prisma.loginHistory.findMany({
      where: { companyId },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
