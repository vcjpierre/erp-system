import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;

    if (tenantId) {
      (req as Record<string, unknown>).tenantId = tenantId;
    }

    next();
  }
}
