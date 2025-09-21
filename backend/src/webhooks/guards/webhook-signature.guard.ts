import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { ApiKeyServiceIdentifier } from '../../api-keys/entities/api-key.entity';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name);

  constructor(
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    const tenantId = request.headers['x-tenant-id'] as string;
    const signatureHeader = request.headers['x-mozzarella-signature-256'] as string;
    
    if (!tenantId || !signatureHeader) {
      throw new UnauthorizedException('Faltan las cabeceras de autenticación del webhook (x-tenant-id, x-mozzarella-signature-256).');
    }

    // Para la comunicación entrante, asumimos que el SuperAdmin ha generado una clave para el servicio de facturación.
    const apiKey = await this.apiKeysService.findActiveKeyForService(tenantId, ApiKeyServiceIdentifier.INVOICING);

    if (!apiKey) {
      throw new UnauthorizedException('No se encontró una clave de API de facturación activa para este tenant.');
    }

    const secret = await this.apiKeysService.getDecryptedKey(apiKey.id, tenantId);

    const signatureParts = signatureHeader.split('=');
    if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
        throw new UnauthorizedException('Formato de firma inválido. Se esperaba "sha256=..."');
    }
    const receivedSignature = signatureParts[1];

    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(JSON.stringify(request.body)).digest('hex');

    const areSignaturesEqual = crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
    );

    if (!areSignaturesEqual) {
        this.logger.warn(`Fallo de validación de firma para tenant ${tenantId}.`);
        throw new UnauthorizedException('La firma del webhook es inválida.');
    }

    (request as any).tenantId = tenantId;
    return true;
  }
}