import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    mockAuthService = {
      isTokenBlacklisted: jest.fn(),
    } as any;

    strategy = new JwtRefreshStrategy(mockAuthService);
  });

  afterEach(() => {
    delete process.env.JWT_REFRESH_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload with refresh token', async () => {
    const req = { body: { refreshToken: 'valid-refresh-token' } };
    const payload = { userId: 1, email: 'test@example.com' };

    mockAuthService.isTokenBlacklisted.mockResolvedValue(false);

    const result = await strategy.validate(req, payload);
    expect(result).toEqual(payload);
    expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
      'valid-refresh-token',
    );
  });

  it('should throw UnauthorizedException when refresh token is missing', async () => {
    const req = { body: {} };
    const payload = { userId: 1, email: 'test@example.com' };

    await expect(strategy.validate(req, payload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(strategy.validate(req, payload)).rejects.toThrow(
      'Refresh token missing',
    );
  });

  it('should throw UnauthorizedException when refresh token is null', async () => {
    const req = { body: { refreshToken: null } };
    const payload = { userId: 1, email: 'test@example.com' };

    await expect(strategy.validate(req, payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when refresh token is blacklisted', async () => {
    const req = { body: { refreshToken: 'blacklisted-token' } };
    const payload = { userId: 1, email: 'test@example.com' };

    mockAuthService.isTokenBlacklisted.mockResolvedValue(true);

    await expect(strategy.validate(req, payload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(strategy.validate(req, payload)).rejects.toThrow(
      'Refresh token has been revoked',
    );
  });

  it('should have correct strategy name', () => {
    expect(strategy.constructor.name).toBe('JwtRefreshStrategy');
  });
});
