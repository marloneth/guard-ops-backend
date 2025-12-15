import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS } from '../constants/permissions.constants';
import { ROLE_PERMISSIONS } from '../constants/roles.constants';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user?: any, handler?: any) => {
    const mockContext = {
      getHandler: () => handler || jest.fn(),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;

    return mockContext;
  };

  it('should allow access when no permissions are required', () => {
    reflector.get.mockReturnValue(undefined);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when permissions array is empty', () => {
    reflector.get.mockReturnValue([]);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has admin role with wildcard permissions', () => {
    reflector.get.mockReturnValue([PERMISSIONS.USER.VIEW]);
    const user = {
      role: { name: 'ADMIN' },
    };
    const context = createMockContext(user);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required permissions', () => {
    reflector.get.mockReturnValue([PERMISSIONS.USER.VIEW]);
    const user = {
      role: { name: 'SUPERVISOR' },
    };
    const context = createMockContext(user);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access when user lacks required permissions', () => {
    reflector.get.mockReturnValue([PERMISSIONS.SYSTEM.CONFIGURE]);
    const user = {
      role: { name: 'GUARD' },
    };
    const context = createMockContext(user);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user has no role', () => {
    reflector.get.mockReturnValue([PERMISSIONS.USER.VIEW]);
    const user = {};
    const context = createMockContext(user);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    reflector.get.mockReturnValue([PERMISSIONS.USER.VIEW]);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should check permissions from handler if available', () => {
    reflector.get.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return [PERMISSIONS.USER.VIEW];
      return undefined;
    });
    const user = {
      role: { name: 'SUPERVISOR' },
    };
    const context = createMockContext(user);

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.get).toHaveBeenCalledWith(
      PERMISSIONS_KEY,
      expect.any(Function),
    );
  });

  it('should check permissions from class if handler permissions not found', () => {
    reflector.get.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) {
        // First call (handler) returns undefined, second call (class) returns permissions
        return reflector.get.mock.calls.length === 1
          ? undefined
          : [PERMISSIONS.USER.VIEW];
      }
      return undefined;
    });
    const user = {
      role: { name: 'SUPERVISOR' },
    };
    const context = createMockContext(user);

    expect(guard.canActivate(context)).toBe(true);
  });
});
