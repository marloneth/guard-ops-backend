import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtAccessStrategy } from './jwt-access.strategy';

describe('JwtAccessStrategy', () => {
  let strategy: JwtAccessStrategy;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';

    mockAuthService = {
      isTokenBlacklisted: jest.fn(),
    } as any;

    strategy = new JwtAccessStrategy(mockAuthService);
  });

  afterEach(() => {
    delete process.env.JWT_ACCESS_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload correctly', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const payload = { userId: 1, email: 'test@example.com' };

    mockAuthService.isTokenBlacklisted.mockResolvedValue(false);

    const result = await strategy.validate(req, payload);
    expect(result).toEqual(payload);
    expect(mockAuthService.isTokenBlacklisted).toHaveBeenCalledWith(
      'valid-token',
    );
  });

  it('should throw UnauthorizedException when token is blacklisted', async () => {
    const req = {
      headers: { authorization: 'Bearer blacklisted-token' },
    };
    const payload = { userId: 1, email: 'test@example.com' };

    mockAuthService.isTokenBlacklisted.mockResolvedValue(true);

    await expect(strategy.validate(req, payload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(strategy.validate(req, payload)).rejects.toThrow(
      'Token has been revoked',
    );
  });

  it('should have correct strategy name', () => {
    expect(strategy.constructor.name).toBe('JwtAccessStrategy');
  });
});
