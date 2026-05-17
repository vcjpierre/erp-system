import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) throw new ConflictException('Warehouse code already exists');

    return this.prisma.warehouse.create({ data: { ...dto, companyId } });
  }

  async findAll(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where: { companyId, deletedAt: null },
        skip, take: limit,
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warehouse.count({ where: { companyId, deletedAt: null } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(companyId: string, id: string) {
    const wh = await this.prisma.warehouse.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { branch: true },
    });
    if (!wh) throw new NotFoundException('Warehouse not found');
    return wh;
  }

  async update(companyId: string, id: string, dto: UpdateWarehouseDto) {
    await this.findOne(companyId, id);
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
