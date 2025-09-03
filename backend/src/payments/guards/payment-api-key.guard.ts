import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantsService } from '../../tenants/tenants.service';

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  constructor(private readonly tenantsService: TenantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.query.apiKey;

    if (!apiKey) {
      throw new UnauthorizedException('Falta el parámetro "apiKey" en la URL del webhook.');
    }

    const tenant = await this.tenantsService.findByApiKey(apiKey);
    if (!tenant) {
      throw new UnauthorizedException('Clave de API para webhook no válida.');
    }

    request.tenant = tenant; // Adjunta el tenant al objeto de la petición
    return true;
  }
}