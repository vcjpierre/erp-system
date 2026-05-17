import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { hashPassword } from '../../common/utils/password.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await hashPassword(dto.password);

    const roleId = dto.roleId || (await this.getDefaultRole(companyId)).id;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        companyId,
        roleId,
      },
      include: { role: true, company: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { companyId, deletedAt: null },
        skip,
        take: limit,
        include: { role: true, company: true, branches: { include: { branch: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { companyId, deletedAt: null } }),
    ]);

    const sanitized = users.map(({ password, ...rest }) => rest);

    return {
      data: sanitized,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { role: true, company: true, branches: { include: { branch: true } } },
    });

    if (!user) throw new NotFoundException('User not found');

    const { password, ...result } = user;
    return result;
  }

  async update(companyId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(companyId, id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true, company: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  private async getDefaultRole(companyId: string) {
    let role = await this.prisma.role.findFirst({
      where: { companyId, isSystem: true },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: 'User',
          description: 'Default user role',
          isSystem: true,
          companyId,
        },
      });
    }

    return role;
  }
}
