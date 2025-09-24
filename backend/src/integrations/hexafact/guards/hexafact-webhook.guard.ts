import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HexaFactWebhookGuard implements CanActivate {
  private readonly expectedApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.expectedApiKey = this.configService.get<string>('HEXAFACT_WEBHOOK_API_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedApiKey = request.headers['x-webhook-api-key'];

    if (this.expectedApiKey && providedApiKey === this.expectedApiKey) {
      return true;
    }

    throw new UnauthorizedException('API Key de Webhook inválida o no proporcionada.');
  }
}