import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

jest.mock('argon2', () => ({
  __esModule: true,
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockPrismaService: any;

  beforeEach(() => {
    jest.resetAllMocks();

    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
      decode: jest.fn(),
    };

    mockPrismaService = {
      tokenBlacklist: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    service = new AuthService(
      mockUsersService,
      mockJwtService,
      mockPrismaService,
    );
  });

  it('register should hash password, create user and return issued tokens', async () => {
    const dto = {
      email: 'new@user.test',
      firstName: 'New',
      lastName: 'User',
      password: 'plain-password',
    };

    jest.spyOn(argon2, 'hash').mockResolvedValueOnce('hashed-password');

    mockUsersService.create.mockResolvedValueOnce({
      id: '10',
      email: dto.email,
      roleId: 1,
    });

    mockUsersService.findById.mockResolvedValueOnce({
      id: '10',
      email: dto.email,
      roleId: 1,
    });

    mockJwtService.signAsync
      .mockResolvedValueOnce('access-token-register')
      .mockResolvedValueOnce('refresh-token-register');

    const result = await service.register(dto as any);

    expect(argon2.hash).toHaveBeenCalledWith(dto.password);
    expect(mockUsersService.create).toHaveBeenCalledWith({
      email: dto.email,
      passwordHash: 'hashed-password',
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: { connect: { id: 1 } },
    });

    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: '10', roleId: 1 },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: '10' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    expect(result).toEqual({
      accessToken: 'access-token-register',
      refreshToken: 'refresh-token-register',
    });
  });

  it('login should return tokens when credentials are valid', async () => {
    const dto = { email: 'existing@user.test', password: 'pw' };

    mockUsersService.findByEmail.mockResolvedValueOnce({
      id: '20',
      email: dto.email,
      passwordHash: 'hashed-pw',
      roleId: 1,
    });

    mockUsersService.findById.mockResolvedValueOnce({
      id: '20',
      email: dto.email,
      roleId: 1,
    });

    jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);

    mockJwtService.signAsync
      .mockResolvedValueOnce('access-token-login')
      .mockResolvedValueOnce('refresh-token-login');

    const result = await service.login(dto as any);

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(argon2.verify).toHaveBeenCalledWith('hashed-pw', dto.password);

    expect(result).toEqual({
      accessToken: 'access-token-login',
      refreshToken: 'refresh-token-login',
    });
  });

  it('login should throw UnauthorizedException when user not found', async () => {
    mockUsersService.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.login({ email: 'no@user', password: 'x' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw UnauthorizedException when password is invalid', async () => {
    mockUsersService.findByEmail.mockResolvedValueOnce({
      id: '30',
      email: 'user@t.test',
      passwordHash: 'hashed',
      roleId: 1,
    });

    jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

    await expect(
      service.login({ email: 'user@t.test', password: 'wrong' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refreshTokens should call issueTokens and return tokens', async () => {
    mockUsersService.findById.mockResolvedValueOnce({
      id: '55',
      email: 'r@t.test',
      roleId: 1,
    });

    mockJwtService.signAsync
      .mockResolvedValueOnce('access-token-refresh')
      .mockResolvedValueOnce('refresh-token-refresh');

    const result = await service.refreshTokens('55');

    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: '55', roleId: 1 },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: '55' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    expect(result).toEqual({
      accessToken: 'access-token-refresh',
      refreshToken: 'refresh-token-refresh',
    });
  });

  it('register should propagate error when usersService.create fails', async () => {
    const dto = {
      email: 'new@user.test',
      firstName: 'New',
      lastName: 'User',
      password: 'plain-password',
    };

    (argon2.hash as jest.Mock).mockResolvedValueOnce('hashed-password');
    mockUsersService.create.mockRejectedValueOnce(new Error('db error'));

    await expect(service.register(dto as any)).rejects.toThrow('db error');
  });

  it('issueTokens should propagate jwt.signAsync errors', async () => {
    const dto = {
      email: 'new@user.test',
      firstName: 'New',
      lastName: 'User',
      password: 'plain-password',
    };

    (argon2.hash as jest.Mock).mockResolvedValueOnce('hashed-password');
    mockUsersService.create.mockResolvedValueOnce({
      id: '10',
      email: dto.email,
      roleId: 1,
    });
    mockUsersService.findById.mockResolvedValueOnce({
      id: '10',
      email: dto.email,
      roleId: 1,
    });
    mockJwtService.signAsync.mockRejectedValueOnce(new Error('jwt failure'));

    await expect(service.register(dto as any)).rejects.toThrow('jwt failure');
  });

  it('logout should decode token and add to blacklist', async () => {
    const dto = { refreshToken: 'valid.refresh.token' };
    const userId = 'user-123';
    const decodedToken = {
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    mockJwtService.decode.mockReturnValueOnce(decodedToken);
    mockPrismaService.tokenBlacklist.create.mockResolvedValueOnce({});

    const result = await service.logout(dto, userId);

    expect(mockJwtService.decode).toHaveBeenCalledWith('valid.refresh.token');
    expect(mockPrismaService.tokenBlacklist.create).toHaveBeenCalledWith({
      data: {
        token: 'valid.refresh.token',
        userId,
        expiresAt: new Date(decodedToken.exp * 1000),
      },
    });
    expect(result).toEqual({ message: 'Logged out successfully' });
  });

  it('logout should throw UnauthorizedException for invalid token', async () => {
    const dto = { refreshToken: 'invalid.token' };
    const userId = 'user-123';

    mockJwtService.decode.mockReturnValueOnce(null);

    await expect(service.logout(dto, userId)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('logout should throw UnauthorizedException for string decoded token', async () => {
    const dto = { refreshToken: 'string.token' };
    const userId = 'user-123';

    mockJwtService.decode.mockReturnValueOnce('string');

    await expect(service.logout(dto, userId)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('isTokenBlacklisted should return true when token is blacklisted', async () => {
    const token = 'blacklisted.token';
    mockPrismaService.tokenBlacklist.findUnique.mockResolvedValueOnce({
      token,
    });

    const result = await service.isTokenBlacklisted(token);

    expect(mockPrismaService.tokenBlacklist.findUnique).toHaveBeenCalledWith({
      where: { token },
    });
    expect(result).toBe(true);
  });

  it('isTokenBlacklisted should return false when token is not blacklisted', async () => {
    const token = 'valid.token';
    mockPrismaService.tokenBlacklist.findUnique.mockResolvedValueOnce(null);

    const result = await service.isTokenBlacklisted(token);

    expect(mockPrismaService.tokenBlacklist.findUnique).toHaveBeenCalledWith({
      where: { token },
    });
    expect(result).toBe(false);
  });

  it('logout should propagate database errors', async () => {
    const dto = { refreshToken: 'valid.refresh.token' };
    const userId = 'user-123';
    const decodedToken = {
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    mockJwtService.decode.mockReturnValueOnce(decodedToken);
    mockPrismaService.tokenBlacklist.create.mockRejectedValueOnce(
      new Error('Database error'),
    );

    await expect(service.logout(dto, userId)).rejects.toThrow('Database error');
  });
});
