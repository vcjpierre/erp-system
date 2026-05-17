import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDIT_KEY = 'audit';
export const Audit = (action: AuditAction, entity: string) =>
  SetMetadata(AUDIT_KEY, { action, entity });
