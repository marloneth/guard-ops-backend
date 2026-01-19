import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, firstName, lastName, password } = dto;
    const passwordHash = await argon2.hash(password);

    const user = await this.usersService.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: {
        connect: { id: 1 },
      },
    });

    return this.issueTokens(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id);
  }

  async refreshTokens(userId: string) {
    return this.issueTokens(userId);
  }

  async logout(dto: LogoutDto, userId: string) {
    const decoded = await this.jwt.decode(dto.refreshToken);
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    const expiresAt = new Date(decoded.exp! * 1000);

    await this.prisma.tokenBlacklist.create({
      data: {
        token: dto.refreshToken,
        userId,
        expiresAt,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklisted;
  }

  async issueTokens(userId: string) {
    const user = await this.usersService.findById(userId);
    const role = await this.rolesService.findById(user.roleId);
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role: role.name },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
