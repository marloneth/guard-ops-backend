import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/permissions.constants';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../constants/roles.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.get<Permission[]>(PERMISSIONS_KEY, context.getHandler()) ??
      this.reflector.get<Permission[]>(PERMISSIONS_KEY, context.getClass());

    // No permissions required → allow
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.role) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];

    // Admin wildcard
    if ((rolePermissions as ['*']).includes('*')) {
      return true;
    }

    return requiredPermissions.some((permission) =>
      (rolePermissions as unknown as Permission[]).includes(permission),
    );
  }
}
