import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  async openSession(companyId: string, userId: string, dto: any) {
    const openSession = await this.prisma.posSession.findFirst({
      where: { companyId, status: 'OPEN' },
    });
    if (openSession) throw new BadRequestException('An open session already exists');

    return this.prisma.posSession.create({
      data: {
        openingDate: new Date(),
        initialCash: dto.initialCash,
        status: 'OPEN',
        companyId,
        openedBy: userId,
      },
    });
  }

  async closeSession(companyId: string, userId: string, id: string, dto: any) {
    const session = await this.prisma.posSession.findFirst({ where: { id, companyId } });
    if (!session) throw new NotFoundException('POS session not found');
    if (session.status !== 'OPEN') throw new BadRequestException('Session is not open');

    return this.prisma.posSession.update({
      where: { id },
      data: {
        closingDate: new Date(),
        finalCash: dto.finalCash,
        totalSales: dto.totalSales,
        status: 'CLOSED',
        closedBy: userId,
        notes: dto.notes,
      },
      include: { movements: true },
    });
  }

  async findAllSessions(companyId: string) {
    return this.prisma.posSession.findMany({
      where: { companyId },
      include: { openedByUser: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { openingDate: 'desc' },
    });
  }

  async findSession(companyId: string, id: string) {
    const session = await this.prisma.posSession.findFirst({
      where: { id, companyId },
      include: {
        movements: { orderBy: { createdAt: 'desc' } },
        openedByUser: { select: { id: true, firstName: true, lastName: true } },
        closedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!session) throw new NotFoundException('POS session not found');
    return session;
  }

  async addMovement(companyId: string, id: string, dto: any) {
    const session = await this.prisma.posSession.findFirst({ where: { id, companyId } });
    if (!session) throw new NotFoundException('POS session not found');
    if (session.status !== 'OPEN') throw new BadRequestException('Session is not open');

    return this.prisma.posMovement.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        reference: dto.reference,
        description: dto.description,
        sessionId: id,
        companyId,
        paymentId: dto.paymentId,
      },
    });
  }
}
