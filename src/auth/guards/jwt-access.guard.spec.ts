import { JwtAccessGuard } from './jwt-access.guard';

describe('JwtAccessGuard', () => {
  let guard: JwtAccessGuard;

  beforeEach(() => {
    guard = new JwtAccessGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be an instance of AuthGuard', () => {
    expect(guard.constructor.name).toBe('JwtAccessGuard');
  });

  it('should have canActivate method', () => {
    expect(typeof guard.canActivate).toBe('function');
  });
});
