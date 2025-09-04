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
exports.Ingredient = void 0;
const typeorm_1 = require("typeorm");
let Ingredient = class Ingredient {
};
exports.Ingredient = Ingredient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Ingredient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Ingredient.prototype, "stockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Ingredient.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        default: 0.0,
        comment: 'Costo por unidad de medida (ej. costo por kg)',
    }),
    __metadata("design:type", Number)
], Ingredient.prototype, "costPerUnit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ingredient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Ingredient.prototype, "updatedAt", void 0);
exports.Ingredient = Ingredient = __decorate([
    (0, typeorm_1.Entity)('ingredients')
], Ingredient);
//# sourceMappingURL=ingredient.entity.js.map