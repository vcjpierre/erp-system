import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{ module: string; action: string }>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.isSuperAdmin) {
      return true;
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        companyId_module_action: {
          companyId: user.companyId,
          module: required.module as never,
          action: required.action as never,
        },
      },
      include: {
        rolePermissions: {
          where: { roleId: user.roleId, granted: true },
        },
      },
    });

    if (!permission || permission.rolePermissions.length === 0) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
