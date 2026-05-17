import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user in company' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List company users' })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.findAll(companyId, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.usersService.findOne(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.usersService.remove(companyId, id);
  }
}
