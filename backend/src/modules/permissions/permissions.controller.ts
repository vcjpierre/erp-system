import {
  Controller, Get, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.permissionsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.permissionsService.findOne(companyId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.permissionsService.remove(companyId, id);
  }

  @Post('assign/:roleId/:permissionId')
  assignToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.assignToRole(roleId, permissionId);
  }
}
