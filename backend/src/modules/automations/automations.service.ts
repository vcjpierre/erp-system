import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AutomationsService {
  constructor(private prisma: PrismaService) {}

  async createApproval(companyId: string, userId: string, dto: any) {
    return this.prisma.approval.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        status: 'PENDING',
        companyId,
        requestedBy: userId,
        approverId: dto.approverId,
      },
      include: {
        requestedByUser: { select: { id: true, firstName: true, lastName: true } },
        approver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async respondToApproval(companyId: string, userId: string, id: string, dto: any) {
    const approval = await this.prisma.approval.findFirst({ where: { id, companyId } });
    if (!approval) throw new NotFoundException('Approval not found');
    if (approval.status !== 'PENDING') throw new BadRequestException('Approval already responded');
    if (approval.approverId !== userId) throw new BadRequestException('You are not the approver');

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: dto.status,
        comment: dto.comment,
        respondedAt: new Date(),
      },
      include: {
        requestedByUser: { select: { id: true, firstName: true, lastName: true } },
        approver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findPendingApprovals(companyId: string, userId: string) {
    return this.prisma.approval.findMany({
      where: { companyId, approverId: userId, status: 'PENDING' },
      include: {
        requestedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async createBusinessRule(companyId: string, dto: any) {
    const { actions, ...data } = dto;
    return this.prisma.businessRule.create({
      data: {
        ...data,
        companyId,
        actions: actions ? {
          create: actions.map((a: any, i: number) => ({
            type: a.type,
            config: a.config,
            order: i,
          })),
        } : undefined,
      },
      include: { actions: { orderBy: { order: 'asc' } } },
    });
  }

  async findAllBusinessRules(companyId: string) {
    return this.prisma.businessRule.findMany({
      where: { companyId },
      include: { actions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
