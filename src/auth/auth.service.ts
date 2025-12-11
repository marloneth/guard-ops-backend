import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
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

    return this.issueTokens(Number(user.id), user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(Number(user.id), user.email);
  }

  async refreshTokens(userId: number, email: string) {
    return this.issueTokens(userId, email);
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

  async issueTokens(userId: number, email: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email },
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
