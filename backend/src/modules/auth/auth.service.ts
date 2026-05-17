import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { EventBus } from '../../events/event-bus';
import { hashPassword, comparePassword } from '../../common/utils/password.utils';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private eventBus: EventBus,
  ) {}

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      await this.eventBus.emit('auth.login.failed', {
        email: dto.email,
        ipAddress: ipAddress || 'unknown',
      }, { companyId: user.companyId });
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.companyId, user.roleId, user.isSuperAdmin);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    await this.eventBus.emit('auth.login.success', {
      email: dto.email,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    }, { userId: user.id, companyId: user.companyId });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(dto.password);

    const company = await this.prisma.company.create({
      data: {
        legalName: dto.companyName || `${dto.firstName} ${dto.lastName} - Company`,
        tradeName: dto.companyName || `${dto.firstName}'s Company`,
        taxId: dto.companyTaxId || `TEMP-${uuidv4().substring(0, 8)}`,
        email: dto.email,
      },
    });

    const defaultRole = await this.prisma.role.create({
      data: {
        name: 'Administrator',
        description: 'Full system access',
        isSystem: true,
        companyId: company.id,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'ACTIVE',
        companyId: company.id,
        roleId: defaultRole.id,
      },
      include: { company: true, role: true },
    });

    await this.eventBus.emit('company.created', {
      legalName: company.legalName,
      taxId: company.taxId,
    }, { userId: user.id, companyId: company.id });

    await this.eventBus.emit('user.created', {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    }, { userId: user.id, companyId: company.id });

    const tokens = await this.generateTokens(user.id, user.email, company.id, defaultRole.id, false);

    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.sanitizeUser(user),
      company: { id: company.id, legalName: company.legalName },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { company: true, role: true } } },
    });

    if (!refreshToken || refreshToken.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > refreshToken.expiresAt) {
      await this.prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(
      refreshToken.userId,
      refreshToken.user.email,
      refreshToken.user.companyId,
      refreshToken.user.roleId,
      refreshToken.user.isSuperAdmin,
    );

    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: refreshToken.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.sanitizeUser(refreshToken.user),
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { isRevoked: true },
      });
    }

    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    await this.eventBus.emit('auth.logout', {}, { userId });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.redisService.setJson(
      `password_reset:${resetToken}`,
      { userId: user.id, email: user.email },
      3600,
    );

    this.logger.log(`Password reset token generated for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const data = await this.redisService.getJson<{ userId: string; email: string }>(
      `password_reset:${token}`,
    );

    if (!data) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    await this.redisService.del(`password_reset:${token}`);

    await this.eventBus.emit('auth.password.reset', {
      email: data.email,
    }, { userId: data.userId });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    });

    await this.eventBus.emit('auth.password.changed', {}, { userId });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
        branches: {
          include: { branch: true },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, companyId: string, roleId: string, isSuperAdmin: boolean) {
    const payload = { sub: userId, email, companyId, roleId, isSuperAdmin };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      uuidv4(),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const { password, ...rest } = user;
    return rest;
  }
}
