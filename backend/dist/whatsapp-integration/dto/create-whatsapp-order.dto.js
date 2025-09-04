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
exports.CreateWhatsappOrderDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const order_types_enum_1 = require("../../orders/enums/order-types.enum");
class WhatsappOrderItemDto {
}
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], WhatsappOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WhatsappOrderItemDto.prototype, "quantity", void 0);
class CreateWhatsappOrderDto {
}
exports.CreateWhatsappOrderDto = CreateWhatsappOrderDto;
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateWhatsappOrderDto.prototype, "customerPhone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWhatsappOrderDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.orderType === order_types_enum_1.OrderType.Delivery),
    (0, class_validator_1.IsNotEmpty)({ message: 'La dirección de entrega es obligatoria para pedidos a domicilio.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWhatsappOrderDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(order_types_enum_1.OrderType),
    __metadata("design:type", String)
], CreateWhatsappOrderDto.prototype, "orderType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WhatsappOrderItemDto),
    __metadata("design:type", Array)
], CreateWhatsappOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateWhatsappOrderDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(order_types_enum_1.PaymentMethod),
    __metadata("design:type", String)
], CreateWhatsappOrderDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=create-whatsapp-order.dto.js.map