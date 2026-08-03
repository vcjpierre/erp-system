import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SecurityService } from './security.service';

@ApiTags('Security')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('roles')
  getRoles(@Req() req: any) {
    return this.securityService.getRoles(req.user.companyId);
  }

  @Get('roles/:id')
  getRole(@Req() req: any, @Param('id') id: string) {
    return this.securityService.getRole(req.user.companyId, id);
  }

  @Post('roles')
  createRole(@Req() req: any, @Body() body: any) {
    return this.securityService.createRole(req.user.companyId, body);
  }

  @Put('roles/:id')
  updateRole(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.securityService.updateRole(req.user.companyId, id, body);
  }

  @Delete('roles/:id')
  deleteRole(@Req() req: any, @Param('id') id: string) {
    return this.securityService.deleteRole(req.user.companyId, id);
  }

  @Post('roles/:id/permissions')
  assignPermissions(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.securityService.assignPermissions(req.user.companyId, id, body.permissionIds);
  }

  @Delete('roles/:id/permissions/:permissionId')
  removePermission(@Param('id') roleId: string, @Param('permissionId') permissionId: string) {
    return this.securityService.removePermission(roleId, permissionId);
  }

  @Get('permissions')
  getPermissions(@Req() req: any) {
    return this.securityService.getPermissions(req.user.companyId);
  }

  @Get('sessions')
  getActiveSessions(@Req() req: any) {
    return this.securityService.getActiveSessions(req.user.companyId);
  }

  @Get('sessions/mine')
  getMySessions(@Req() req: any) {
    return this.securityService.getMySessions(req.user.sub);
  }

  @Delete('sessions/:id')
  terminateSession(@Param('id') id: string) {
    return this.securityService.terminateSession(id);
  }

  @Delete('sessions')
  terminateAllSessions(@Req() req: any) {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    return this.securityService.terminateAllSessions(req.user.sub, token);
  }

  @Get('login-history')
  getLoginHistory(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.securityService.getLoginHistory(
      req.user.companyId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('login-history/users/:userId')
  getUserLoginHistory(@Req() req: any, @Param('userId') userId: string) {
    return this.securityService.getUserLoginHistory(userId, req.user.companyId);
  }

  @Get('policies')
  getSecurityPolicies(@Req() req: any) {
    return this.securityService.getSecurityPolicies(req.user.companyId);
  }

  @Post('policies')
  createSecurityPolicy(@Req() req: any, @Body() body: any) {
    return this.securityService.createSecurityPolicy(req.user.companyId, body);
  }

  @Put('policies/:id')
  updateSecurityPolicy(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.securityService.updateSecurityPolicy(req.user.companyId, id, body);
  }

  @Delete('policies/:id')
  deleteSecurityPolicy(@Req() req: any, @Param('id') id: string) {
    return this.securityService.deleteSecurityPolicy(req.user.companyId, id);
  }

  @Get('users')
  getUsers(@Req() req: any) {
    return this.securityService.getUsers(req.user.companyId);
  }

  @Put('users/:id/role')
  changeUserRole(@Param('id') id: string, @Body() body: any) {
    return this.securityService.changeUserRole(id, body.roleId);
  }

  @Put('users/:id/status')
  changeUserStatus(@Param('id') id: string, @Body() body: any) {
    return this.securityService.changeUserStatus(id, body.status);
  }
}
