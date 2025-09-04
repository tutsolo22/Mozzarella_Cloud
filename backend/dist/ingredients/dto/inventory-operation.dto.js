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
exports.AdjustStockDto = exports.RegisterWasteDto = exports.PurchaseIngredientsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class OperationItemDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], OperationItemDto.prototype, "ingredientId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], OperationItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OperationItemDto.prototype, "reason", void 0);
class PurchaseIngredientsDto {
}
exports.PurchaseIngredientsDto = PurchaseIngredientsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OperationItemDto),
    __metadata("design:type", Array)
], PurchaseIngredientsDto.prototype, "items", void 0);
class RegisterWasteDto extends PurchaseIngredientsDto {
}
exports.RegisterWasteDto = RegisterWasteDto;
class AdjustmentItemDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdjustmentItemDto.prototype, "ingredientId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AdjustmentItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdjustmentItemDto.prototype, "reason", void 0);
class AdjustStockDto {
}
exports.AdjustStockDto = AdjustStockDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AdjustmentItemDto),
    __metadata("design:type", Array)
], AdjustStockDto.prototype, "items", void 0);
//# sourceMappingURL=inventory-operation.dto.js.map