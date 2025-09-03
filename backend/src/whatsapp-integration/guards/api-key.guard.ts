import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantsService } from '../../tenants/tenants.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly tenantsService: TenantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('Falta la cabecera X-API-Key.');
    }

    const tenant = await this.tenantsService.findByApiKey(apiKey);
    if (!tenant) {
      throw new UnauthorizedException('Clave de API no válida.');
    }

    request.tenant = tenant; // Attach tenant to the request object
    return true;
  }
}