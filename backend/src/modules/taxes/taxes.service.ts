import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTaxDto) {
    const existing = await this.prisma.tax.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) throw new ConflictException('Tax name already exists');

    return this.prisma.tax.create({
      data: { ...dto, rate: dto.rate, companyId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.tax.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
  }

  async findOne(companyId: string, id: string) {
    const tax = await this.prisma.tax.findFirst({ where: { id, companyId } });
    if (!tax) throw new NotFoundException('Tax not found');
    return tax;
  }

  async update(companyId: string, id: string, dto: UpdateTaxDto) {
    await this.findOne(companyId, id);
    return this.prisma.tax.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.tax.update({ where: { id }, data: { isActive: false } });
  }
}
