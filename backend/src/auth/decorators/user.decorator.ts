import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Define la estructura del payload del usuario que se extrae del token JWT.
 */
export interface UserPayload {
  userId: string; // Mapeado desde 'sub' en el token
  email: string;
  role: string;
  locationId?: string;
  tenantId: string;
}

/**
 * Extrae el objeto `user` que fue adjuntado a la request por el `JwtAuthGuard`.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserPayload;
  },
);