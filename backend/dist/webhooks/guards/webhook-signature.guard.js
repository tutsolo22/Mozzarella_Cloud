"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhookSignatureGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const api_keys_service_1 = require("../../api-keys/api-keys.service");
const api_key_entity_1 = require("../../api-keys/entities/api-key.entity");
let WebhookSignatureGuard = WebhookSignatureGuard_1 = class WebhookSignatureGuard {
    constructor(apiKeysService) {
        this.apiKeysService = apiKeysService;
        this.logger = new common_1.Logger(WebhookSignatureGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.headers['x-tenant-id'];
        const signatureHeader = request.headers['x-mozzarella-signature-256'];
        if (!tenantId || !signatureHeader) {
            throw new common_1.UnauthorizedException('Faltan las cabeceras de autenticación del webhook (x-tenant-id, x-mozzarella-signature-256).');
        }
        const apiKey = await this.apiKeysService.findActiveKeyForService(tenantId, api_key_entity_1.ApiKeyServiceIdentifier.INVOICING);
        if (!apiKey) {
            throw new common_1.UnauthorizedException('No se encontró una clave de API de facturación activa para este tenant.');
        }
        const secret = await this.apiKeysService.getDecryptedKey(apiKey.id, tenantId);
        const signatureParts = signatureHeader.split('=');
        if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
            throw new common_1.UnauthorizedException('Formato de firma inválido. Se esperaba "sha256=..."');
        }
        const receivedSignature = signatureParts[1];
        const hmac = crypto.createHmac('sha256', secret);
        const computedSignature = hmac.update(JSON.stringify(request.body)).digest('hex');
        const areSignaturesEqual = crypto.timingSafeEqual(Buffer.from(computedSignature, 'hex'), Buffer.from(receivedSignature, 'hex'));
        if (!areSignaturesEqual) {
            this.logger.warn(`Fallo de validación de firma para tenant ${tenantId}.`);
            throw new common_1.UnauthorizedException('La firma del webhook es inválida.');
        }
        request.tenantId = tenantId;
        return true;
    }
};
exports.WebhookSignatureGuard = WebhookSignatureGuard;
exports.WebhookSignatureGuard = WebhookSignatureGuard = WebhookSignatureGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService])
], WebhookSignatureGuard);
//# sourceMappingURL=webhook-signature.guard.js.map