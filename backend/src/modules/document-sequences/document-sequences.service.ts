import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentSequencesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, documentType: DocumentType, prefix: string, length = 8, mask?: string) {
    const existing = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType } },
    });
    if (existing) throw new BadRequestException('Document sequence already exists for this type');

    return this.prisma.documentSequence.create({
      data: { companyId, documentType, prefix, length, mask },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.documentSequence.findMany({
      where: { companyId },
      orderBy: { documentType: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const seq = await this.prisma.documentSequence.findFirst({
      where: { id, companyId },
    });
    if (!seq) throw new NotFoundException('Document sequence not found');
    return seq;
  }

  async getNextNumber(companyId: string, documentType: DocumentType) {
    return this.prisma.$transaction(async (tx) => {
      const seq = await tx.documentSequence.findUnique({
        where: { companyId_documentType: { companyId, documentType } },
      });
      if (!seq) throw new NotFoundException('Document sequence not configured for this type');

      const number = seq.nextNumber;
      const padded = String(number).padStart(seq.length, '0');
      const formatted = seq.mask
        ? seq.mask.replace('{prefix}', seq.prefix).replace('{number}', padded)
        : `${seq.prefix}${padded}`;

      await tx.documentSequence.update({
        where: { id: seq.id },
        data: { nextNumber: seq.nextNumber + 1 },
      });

      return { documentType, number, formatted, prefix: seq.prefix, length: seq.length };
    });
  }

  async resetSequence(companyId: string, id: string, startFrom = 1) {
    await this.findOne(companyId, id);

    return this.prisma.documentSequence.update({
      where: { id },
      data: { nextNumber: startFrom },
    });
  }

  async update(companyId: string, id: string, data: { prefix?: string; length?: number; mask?: string }) {
    await this.findOne(companyId, id);
    return this.prisma.documentSequence.update({ where: { id }, data });
  }
}
