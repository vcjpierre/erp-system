import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async createLead(companyId: string, dto: any) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAllLeads(companyId: string) {
    return this.prisma.lead.findMany({
      where: { companyId },
      include: {
        _count: { select: { activities: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLead(companyId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
        deals: { include: { pipelineStage: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateLead(companyId: string, id: string, dto: any) {
    const existing = await this.prisma.lead.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Lead not found');
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  async removeLead(companyId: string, id: string) {
    const existing = await this.prisma.lead.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Lead not found');
    return this.prisma.lead.delete({ where: { id } });
  }

  async createPipeline(companyId: string, dto: any) {
    const { stages, ...data } = dto;
    return this.prisma.pipeline.create({
      data: {
        ...data,
        companyId,
        stages: stages ? { create: stages.map((s: any, i: number) => ({ ...s, order: i, companyId })) } : undefined,
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  async findAllPipelines(companyId: string) {
    return this.prisma.pipeline.findMany({
      where: { companyId },
      include: { stages: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createDeal(companyId: string, dto: any) {
    return this.prisma.deal.create({
      data: { ...dto, companyId },
      include: { pipelineStage: true, lead: true },
    });
  }

  async findAllDeals(companyId: string) {
    return this.prisma.deal.findMany({
      where: { companyId },
      include: { pipelineStage: true, lead: true, assignedUser: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDealStage(companyId: string, id: string, pipelineStageId: string) {
    const deal = await this.prisma.deal.findFirst({ where: { id, companyId } });
    if (!deal) throw new NotFoundException('Deal not found');
    const stage = await this.prisma.pipelineStage.findFirst({ where: { id: pipelineStageId, companyId } });
    if (!stage) throw new NotFoundException('Pipeline stage not found');
    return this.prisma.deal.update({
      where: { id },
      data: { pipelineStageId },
      include: { pipelineStage: true, lead: true },
    });
  }

  async createActivity(companyId: string, userId: string, dto: any) {
    return this.prisma.activity.create({
      data: { ...dto, companyId, createdBy: userId },
    });
  }

  async findAllActivities(companyId: string) {
    return this.prisma.activity.findMany({
      where: { companyId },
      include: { lead: { select: { id: true, firstName: true, lastName: true } }, createdByUser: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createFollowUp(companyId: string, dto: any) {
    return this.prisma.followUp.create({
      data: { ...dto, companyId },
      include: { assignedUser: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAllFollowUps(companyId: string) {
    return this.prisma.followUp.findMany({
      where: { companyId },
      include: { assignedUser: { select: { id: true, firstName: true, lastName: true } }, lead: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { date: 'asc' },
    });
  }
}
