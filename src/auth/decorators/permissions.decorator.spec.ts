import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from '../constants/permissions.constants';
import { PERMISSIONS_KEY, Permissions } from './permissions.decorator';

describe('Permissions Decorator', () => {
  let mockSetMetadata: jest.MockedFunction<typeof SetMetadata>;

  beforeEach(() => {
    mockSetMetadata = SetMetadata as jest.MockedFunction<typeof SetMetadata>;
    mockSetMetadata.mockClear();
  });

  it('should call SetMetadata with correct key and permissions', () => {
    const permissions = [PERMISSIONS.USER.VIEW, PERMISSIONS.SYSTEM.CONFIGURE];
    
    Permissions(...permissions);

    expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSIONS_KEY, permissions);
  });

  it('should handle empty permissions array', () => {
    const permissions: string[] = [];
    
    Permissions(...permissions);

    expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSIONS_KEY, permissions);
  });

  it('should handle single permission', () => {
    const permissions = [PERMISSIONS.USER.VIEW];
    
    Permissions(...permissions);

    expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSIONS_KEY, permissions);
  });

  it('should export PERMISSIONS_KEY constant', () => {
    expect(PERMISSIONS_KEY).toBe('permissions');
  });
});