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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("../../tenants/tenants.service");
let PaymentApiKeyGuard = class PaymentApiKeyGuard {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.query.apiKey;
        if (!apiKey) {
            throw new common_1.UnauthorizedException('Falta el parámetro "apiKey" en la URL del webhook.');
        }
        const tenant = await this.tenantsService.findByApiKey(apiKey);
        if (!tenant) {
            throw new common_1.UnauthorizedException('Clave de API para webhook no válida.');
        }
        request.tenant = tenant;
        return true;
    }
};
exports.PaymentApiKeyGuard = PaymentApiKeyGuard;
exports.PaymentApiKeyGuard = PaymentApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], PaymentApiKeyGuard);
//# sourceMappingURL=payment-api-key.guard.js.map