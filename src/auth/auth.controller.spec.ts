import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  const registerResponseSuccess = {
    accessToken: 'register.access.token',
    refreshToken: 'register.refresh.token',
  };

  const loginResponseSuccess = {
    accessToken: 'login.access.token',
    refreshToken: 'login.refresh.token',
  };

  const refreshResponseSuccess = {
    accessToken: 'refresh.access.token',
    refreshToken: 'refresh.refresh.token',
  };

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue(registerResponseSuccess),
      login: jest.fn().mockResolvedValue(loginResponseSuccess),
      refreshTokens: jest.fn().mockResolvedValue(refreshResponseSuccess),
      logout: jest
        .fn()
        .mockResolvedValue({ message: 'Logged out successfully' }),
    };

    controller = new AuthController(mockAuthService);
  });

  it('should call authService.register with dto and return its result', async () => {
    const dto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Example',
      password: '53cre7.P@55',
    };

    const result = await controller.register(dto);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(registerResponseSuccess);
  });

  it('should call authService.login with dto and return its result', async () => {
    const dto = { email: 'test@example.com', password: 'secret' } as any;
    const result = await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(loginResponseSuccess);
  });

  it('should call authService.refreshTokens with req.user.sub and req.user.email and return its result', async () => {
    const req = {
      user: { sub: 'user-id-123', email: 'test@example.com' },
    } as any;
    const result = await controller.refresh(req, {} as any);
    expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
      'user-id-123',
      'test@example.com',
    );
    expect(result).toEqual(refreshResponseSuccess);
  });

  it('getMe should return req.user', () => {
    const user = { sub: 'user-id-123', email: 'test@example.com' };
    const result = controller.getMe({ user } as any);
    expect(result).toBe(user);
  });

  it('register should propagate service errors', async () => {
    const dto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Example',
      password: '53cre7.P@55',
    };
    mockAuthService.register.mockRejectedValueOnce(new Error('service error'));

    await expect(controller.register(dto)).rejects.toThrow('service error');
  });

  it('refresh should propagate service errors', async () => {
    const req = {
      user: { sub: 'user-id-123', email: 'test@example.com' },
    } as any;
    mockAuthService.refreshTokens.mockRejectedValueOnce(
      new Error('refresh error'),
    );

    await expect(controller.refresh(req, {} as any)).rejects.toThrow(
      'refresh error',
    );
  });

  it('should call authService.logout with dto and userId and return its result', async () => {
    const dto = { refreshToken: 'refresh.token' };
    const req = { user: { sub: 'user-id-123' } } as any;
    const result = await controller.logout(dto, req);

    expect(mockAuthService.logout).toHaveBeenCalledWith(dto, 'user-id-123');
    expect(result).toEqual({ message: 'Logged out successfully' });
  });

  it('logout should propagate service errors', async () => {
    const dto = { refreshToken: 'refresh.token' };
    const req = { user: { sub: 'user-id-123' } } as any;
    mockAuthService.logout.mockRejectedValueOnce(new Error('logout error'));

    await expect(controller.logout(dto, req)).rejects.toThrow('logout error');
  });
});
