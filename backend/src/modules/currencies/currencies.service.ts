import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCurrencyDto) {
    const existing = await this.prisma.currency.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) throw new ConflictException('Currency code already exists');

    if (dto.isDefault) {
      await this.prisma.currency.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.currency.create({
      data: { ...dto, exchangeRate: dto.exchangeRate, companyId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.currency.findMany({
      where: { companyId, isActive: true },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const currency = await this.prisma.currency.findFirst({ where: { id, companyId } });
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async update(companyId: string, id: string, dto: UpdateCurrencyDto) {
    await this.findOne(companyId, id);
    if (dto.isDefault) {
      await this.prisma.currency.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.currency.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.currency.update({ where: { id }, data: { isActive: false } });
  }
}
