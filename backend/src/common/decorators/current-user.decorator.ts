import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  roleId: string;
  isSuperAdmin: boolean;
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator<keyof JwtPayload | undefined, ExecutionContext>(
  (data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);
