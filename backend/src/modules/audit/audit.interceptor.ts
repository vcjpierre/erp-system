import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_KEY } from '../../common/decorators/audit.decorator';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.getAllAndOverride(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!auditMeta) return next.handle();

    const request = context.switchToHttp().getRequest();
    const { action, entity } = auditMeta;
    const entityId = request.params.id;
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        this.auditService.create({
          action,
          entity,
          entityId,
          description: `${action} ${entity}${entityId ? ' ' + entityId : ''}`,
          userId: user?.id,
          companyId: user?.companyId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        }).catch(() => {});
      }),
    );
  }
}
