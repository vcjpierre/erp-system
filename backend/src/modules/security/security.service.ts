import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  async getRoles(companyId: string) {
    return this.prisma.role.findMany({
      where: { companyId },
      include: {
        _count: { select: { users: true } },
        rolePermissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRole(companyId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async createRole(companyId: string, data: any) {
    const existing = await this.prisma.role.findUnique({
      where: { companyId_name: { companyId, name: data.name } },
    });
    if (existing) throw new ConflictException('Role already exists');
    return this.prisma.role.create({ data: { ...data, companyId } });
  }

  async updateRole(companyId: string, id: string, data: any) {
    await this.getRole(companyId, id);
    return this.prisma.role.update({ where: { id }, data });
  }

  async deleteRole(companyId: string, id: string) {
    const role = await this.getRole(companyId, id);
    if (role.isSystem) throw new BadRequestException('Cannot delete system roles');
    return this.prisma.role.delete({ where: { id } });
  }

  async assignPermissions(companyId: string, roleId: string, permissionIds: string[]) {
    await this.getRole(companyId, roleId);
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds }, companyId },
    });
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }
    const data = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
      granted: true,
    }));
    await this.prisma.rolePermission.createMany({ data, skipDuplicates: true });
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    const rp = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    if (!rp) throw new NotFoundException('Permission not assigned to role');
    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    return { message: 'Permission removed from role' };
  }

  async getPermissions(companyId: string) {
    return this.prisma.permission.findMany({
      where: { companyId },
      include: { rolePermissions: true },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async getActiveSessions(companyId: string) {
    return this.prisma.session.findMany({
      where: { companyId, isActive: true },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { lastActivity: 'desc' },
    });
  }

  async getMySessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActivity: 'desc' },
    });
  }

  async terminateSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async terminateAllSessions(userId: string, exceptToken?: string) {
    const where: any = { userId, isActive: true };
    if (exceptToken) where.token = { not: exceptToken };
    await this.prisma.session.updateMany({ where, data: { isActive: false } });
    return { message: 'Sessions terminated' };
  }

  async changeUserRole(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: { id: true, email: true, firstName: true, lastName: true, roleId: true },
    });
  }

  async changeUserStatus(userId: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    });
  }

  async getLoginHistory(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.loginHistory.findMany({
        where: { companyId },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loginHistory.count({ where: { companyId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserLoginHistory(userId: string, companyId: string) {
    return this.prisma.loginHistory.findMany({
      where: { userId, companyId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSecurityPolicies(companyId: string) {
    return this.prisma.securityPolicy.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async createSecurityPolicy(companyId: string, data: any) {
    const existing = await this.prisma.securityPolicy.findUnique({
      where: { companyId_name: { companyId, name: data.name } },
    });
    if (existing) throw new ConflictException('Security policy already exists');
    return this.prisma.securityPolicy.create({ data: { ...data, companyId } });
  }

  async updateSecurityPolicy(companyId: string, id: string, data: any) {
    const policy = await this.prisma.securityPolicy.findFirst({ where: { id, companyId } });
    if (!policy) throw new NotFoundException('Security policy not found');
    return this.prisma.securityPolicy.update({ where: { id }, data });
  }

  async deleteSecurityPolicy(companyId: string, id: string) {
    const policy = await this.prisma.securityPolicy.findFirst({ where: { id, companyId } });
    if (!policy) throw new NotFoundException('Security policy not found');
    return this.prisma.securityPolicy.delete({ where: { id } });
  }

  async getUsers(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        isSuperAdmin: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
