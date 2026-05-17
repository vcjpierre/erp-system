import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'] || request.params.companyId;

    if (!user) {
      return true;
    }

    if (user.isSuperAdmin) {
      return true;
    }

    const targetCompanyId = tenantId || user.companyId;

    if (user.companyId !== targetCompanyId) {
      throw new ForbiddenException('Access denied for this company');
    }

    request.companyId = user.companyId;
    return true;
  }
}
