import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      await this.prisma.auditLog.create({ data });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${(error as Error).message}`);
    }
  }

  async findAll(companyId: string, filters: any) {
    const { page = 1, limit = 20, action, entity, entityId, userId, startDate, endDate } = filters;
    const where: any = { companyId };

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(companyId: string, id: string) {
    const log = await this.prisma.auditLog.findFirst({
      where: { id, companyId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async findByEntity(companyId: string, entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { companyId, entity, entityId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(companyId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { companyId, userId };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async remove(companyId: string, id: string) {
    const log = await this.prisma.auditLog.findFirst({ where: { id, companyId } });
    if (!log) throw new NotFoundException('Audit log not found');
    await this.prisma.auditLog.delete({ where: { id } });
  }

  async getStats(companyId: string) {
    const totalLogs = await this.prisma.auditLog.count({ where: { companyId } });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const actionsByType = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: { companyId, createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    });

    const topUsers = await this.prisma.auditLog.groupBy({
      by: ['userId'],
      where: { companyId, createdAt: { gte: thirtyDaysAgo }, userId: { not: null } },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    const logsByDay: any = await this.prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM erp.audit_logs 
      WHERE company_id = ${companyId}::uuid AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at) 
      ORDER BY date DESC
    `;

    return { totalLogs, actionsByType, topUsers, logsByDay };
  }
}
