import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: AuditAction;
    entity: string;
    entityId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    userId?: string;
    companyId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({ data: params as never });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${(error as Error).message}`);
    }
  }

  async findAll(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { companyId },
        skip, take: limit,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { companyId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByUser(companyId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { companyId, userId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { companyId, userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
