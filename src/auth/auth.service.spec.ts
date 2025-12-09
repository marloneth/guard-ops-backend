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

  beforeEach(() => {
    jest.resetAllMocks();

    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
    };

    service = new AuthService(mockUsersService, mockJwtService);
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
      { sub: Number('10'), email: dto.email },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: Number('10'), email: dto.email },
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
    });

    jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

    await expect(
      service.login({ email: 'user@t.test', password: 'wrong' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refreshTokens should call issueTokens and return tokens', async () => {
    mockJwtService.signAsync
      .mockResolvedValueOnce('access-token-refresh')
      .mockResolvedValueOnce('refresh-token-refresh');

    const result = await service.refreshTokens(55, 'r@t.test');

    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: 55, email: 'r@t.test' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: 55, email: 'r@t.test' },
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
    });
    mockJwtService.signAsync.mockRejectedValueOnce(new Error('jwt failure'));

    await expect(service.register(dto as any)).rejects.toThrow('jwt failure');
  });
});
