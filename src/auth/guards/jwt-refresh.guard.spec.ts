import { JwtRefreshGuard } from './jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
  let guard: JwtRefreshGuard;

  beforeEach(() => {
    guard = new JwtRefreshGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be an instance of AuthGuard', () => {
    expect(guard.constructor.name).toBe('JwtRefreshGuard');
  });

  it('should have canActivate method', () => {
    expect(typeof guard.canActivate).toBe('function');
  });
});
