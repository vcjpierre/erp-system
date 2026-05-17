import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { taxId: dto.taxId } });
    if (existing) throw new ConflictException('Tax ID already registered');

    return this.prisma.company.create({ data: dto });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.company.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.company.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.company.update({
      where: { id },
      data: { status: 'INACTIVE', deletedAt: new Date() },
    });
  }
}
