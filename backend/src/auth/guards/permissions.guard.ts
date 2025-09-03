import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Si no se requieren permisos, se permite el acceso.
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permissions) {
      return false; // Si el usuario no tiene permisos en su token, se deniega.
    }

    return requiredPermissions.every((permission) => user.permissions.includes(permission));
  }
}