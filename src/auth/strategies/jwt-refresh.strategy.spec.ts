import { UnauthorizedException } from '@nestjs/common';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;

  beforeEach(() => {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    strategy = new JwtRefreshStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_REFRESH_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload with refresh token', () => {
    const req = { body: { refreshToken: 'valid-refresh-token' } };
    const payload = { userId: 1, email: 'test@example.com' };
    const result = strategy.validate(req, payload);
    expect(result).toEqual(payload);
  });

  it('should throw UnauthorizedException when refresh token is missing', () => {
    const req = { body: {} };
    const payload = { userId: 1, email: 'test@example.com' };

    expect(() => strategy.validate(req, payload)).toThrow(
      UnauthorizedException,
    );
    expect(() => strategy.validate(req, payload)).toThrow(
      'Refresh token missing',
    );
  });

  it('should throw UnauthorizedException when refresh token is null', () => {
    const req = { body: { refreshToken: null } };
    const payload = { userId: 1, email: 'test@example.com' };

    expect(() => strategy.validate(req, payload)).toThrow(
      UnauthorizedException,
    );
  });

  it('should have correct strategy name', () => {
    expect(strategy.constructor.name).toBe('JwtRefreshStrategy');
  });
});
