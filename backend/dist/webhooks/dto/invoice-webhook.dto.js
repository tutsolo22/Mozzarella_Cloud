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
exports.InvoiceWebhookPayload = exports.InvoiceWebhookStatus = void 0;
const class_validator_1 = require("class-validator");
var InvoiceWebhookStatus;
(function (InvoiceWebhookStatus) {
    InvoiceWebhookStatus["INVOICED"] = "invoiced";
    InvoiceWebhookStatus["CANCELLED"] = "cancelled";
    InvoiceWebhookStatus["ERROR"] = "error";
})(InvoiceWebhookStatus || (exports.InvoiceWebhookStatus = InvoiceWebhookStatus = {}));
class InvoiceWebhookPayload {
}
exports.InvoiceWebhookPayload = InvoiceWebhookPayload;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceWebhookPayload.prototype, "internalOrderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceWebhookPayload.prototype, "externalOrderId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(InvoiceWebhookStatus),
    __metadata("design:type", String)
], InvoiceWebhookPayload.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InvoiceWebhookPayload.prototype, "invoiceUrl", void 0);
//# sourceMappingURL=invoice-webhook.dto.js.map