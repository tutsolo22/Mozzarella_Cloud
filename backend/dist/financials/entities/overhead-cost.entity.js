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
exports.OverheadCost = exports.CostFrequency = void 0;
const typeorm_1 = require("typeorm");
const location_entity_1 = require("../../locations/entities/location.entity");
var CostFrequency;
(function (CostFrequency) {
    CostFrequency["OneTime"] = "one-time";
    CostFrequency["Daily"] = "daily";
    CostFrequency["Weekly"] = "weekly";
    CostFrequency["Monthly"] = "monthly";
})(CostFrequency || (exports.CostFrequency = CostFrequency = {}));
let OverheadCost = class OverheadCost {
};
exports.OverheadCost = OverheadCost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OverheadCost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OverheadCost.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', comment: 'ID de la sucursal a la que pertenece el costo' }),
    __metadata("design:type", String)
], OverheadCost.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => location_entity_1.Location),
    (0, typeorm_1.JoinColumn)({ name: 'locationId' }),
    __metadata("design:type", location_entity_1.Location)
], OverheadCost.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], OverheadCost.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], OverheadCost.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OverheadCost.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CostFrequency, default: CostFrequency.OneTime }),
    __metadata("design:type", String)
], OverheadCost.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], OverheadCost.prototype, "costDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OverheadCost.prototype, "updatedAt", void 0);
exports.OverheadCost = OverheadCost = __decorate([
    (0, typeorm_1.Entity)('overhead_costs')
], OverheadCost);
//# sourceMappingURL=overhead-cost.entity.js.map