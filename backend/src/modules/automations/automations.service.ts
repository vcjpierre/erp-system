import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBus } from '../../events/event-bus';
import { WsGateway } from '../../websocket/ws.gateway';

@Injectable()
export class AutomationsService {
  constructor(
    private prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly wsGateway: WsGateway,
  ) {}

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

  async evaluate(companyId: string, trigger: string, context: any) {
    const rules: any[] = await this.prisma.businessRule.findMany({
      where: { companyId, trigger: trigger as any, isActive: true },
      include: { actions: { orderBy: { order: 'asc' } } },
    });

    const triggeredActions: any[] = [];

    for (const rule of rules) {
      if (rule.condition) {
        try {
          const conditionFn = new Function('context', `return ${rule.condition}`);
          if (!conditionFn(context)) continue;
        } catch {
          continue;
        }
      }

      for (const action of rule.actions) {
        triggeredActions.push({ ruleId: rule.id, type: action.type, config: action.config });
      }
    }

    this.eventBus.emit('automations.evaluated', { companyId, trigger, context });
    this.wsGateway.emitToCompany(companyId, 'automations.evaluated', { trigger, matchedCount: triggeredActions.length });

    return { triggered: triggeredActions };
  }
}
