import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateBranchDto) {
    const existing = await this.prisma.branch.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) throw new ConflictException('Branch code already exists');

    if (dto.isDefault) {
      await this.prisma.branch.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.branch.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: { companyId, deletedAt: null },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where: { companyId, deletedAt: null } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(companyId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(companyId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(companyId, id);

    if (dto.isDefault) {
      await this.prisma.branch.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.branch.update({
      where: { id },
      data: { status: 'INACTIVE', deletedAt: new Date() },
    });
  }
}
