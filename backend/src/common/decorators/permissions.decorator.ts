import { SetMetadata } from '@nestjs/common';
import { ModuleName, ActionType } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (module: ModuleName, action: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, { module, action });
