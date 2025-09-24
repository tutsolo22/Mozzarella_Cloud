import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleEnum } from '../../roles/enums/role.enum';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.role === RoleEnum.SuperAdmin) {
      return true;
    }

    // Opcional: puedes lanzar una excepción más específica si lo prefieres.
    throw new ForbiddenException('Acceso denegado. Se requiere rol de Super Administrador.');
  }
}