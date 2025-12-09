import { JwtAccessStrategy } from './jwt-access.strategy';

describe('JwtAccessStrategy', () => {
  let strategy: JwtAccessStrategy;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    strategy = new JwtAccessStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_ACCESS_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload correctly', () => {
    const payload = { userId: 1, email: 'test@example.com' };
    const result = strategy.validate(payload);
    expect(result).toEqual(payload);
  });

  it('should have correct strategy name', () => {
    expect(strategy.constructor.name).toBe('JwtAccessStrategy');
  });
});
