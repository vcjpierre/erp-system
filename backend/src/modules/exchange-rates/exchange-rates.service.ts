import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(private prisma: PrismaService) {}

  async create(currencyId: string, companyId: string, dto: CreateExchangeRateDto) {
    const currency = await this.prisma.currency.findFirst({
      where: { id: currencyId, companyId },
    });
    if (!currency) throw new NotFoundException('Currency not found');

    const date = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.exchangeRate.create({
      data: {
        rate: dto.rate,
        date,
        currencyId,
      },
    });
  }

  async findByCurrency(currencyId: string, companyId: string) {
    const currency = await this.prisma.currency.findFirst({
      where: { id: currencyId, companyId },
    });
    if (!currency) throw new NotFoundException('Currency not found');

    return this.prisma.exchangeRate.findMany({
      where: { currencyId },
      orderBy: { date: 'desc' },
    });
  }

  async getCurrentRates(companyId: string) {
    const currencies = await this.prisma.currency.findMany({
      where: { companyId, isActive: true },
    });

    const rates = await Promise.all(
      currencies.map(async (c) => {
        const latest = await this.prisma.exchangeRate.findFirst({
          where: { currencyId: c.id },
          orderBy: { date: 'desc' },
        });
        return {
          currencyId: c.id,
          code: c.code,
          name: c.name,
          symbol: c.symbol,
          currentRate: latest?.rate ?? Number(c.exchangeRate),
          isDefault: c.isDefault,
        };
      }),
    );

    return rates;
  }

  async remove(currencyId: string, id: string, companyId: string) {
    const currency = await this.prisma.currency.findFirst({
      where: { id: currencyId, companyId },
    });
    if (!currency) throw new NotFoundException('Currency not found');

    const rate = await this.prisma.exchangeRate.findFirst({
      where: { id, currencyId },
    });
    if (!rate) throw new NotFoundException('Exchange rate not found');

    return this.prisma.exchangeRate.delete({ where: { id } });
  }
}
