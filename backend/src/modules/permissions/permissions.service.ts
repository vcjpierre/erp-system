import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({
      where: { companyId_module_action: { companyId, module: dto.module, action: dto.action } },
    });
    if (existing) throw new ConflictException('Permission already exists');

    return this.prisma.permission.create({ data: { ...dto, companyId } });
  }

  async findAll(companyId: string) {
    return this.prisma.permission.findMany({
      where: { companyId },
      include: { rolePermissions: true },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async findOne(companyId: string, id: string) {
    const perm = await this.prisma.permission.findFirst({
      where: { id, companyId },
      include: { rolePermissions: { include: { role: true } } },
    });
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.permission.delete({ where: { id } });
  }

  async assignToRole(roleId: string, permissionId: string, granted = true) {
    return this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId, granted },
      update: { granted },
    });
  }

  async removeFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
