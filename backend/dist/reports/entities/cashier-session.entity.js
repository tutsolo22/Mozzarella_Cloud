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
exports.CashierSession = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let CashierSession = class CashierSession {
};
exports.CashierSession = CashierSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CashierSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CashierSession.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'openedByUserId' }),
    __metadata("design:type", user_entity_1.User)
], CashierSession.prototype, "openedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CashierSession.prototype, "openedByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'closedByUserId' }),
    __metadata("design:type", user_entity_1.User)
], CashierSession.prototype, "closedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CashierSession.prototype, "closedByUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], CashierSession.prototype, "openedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], CashierSession.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, comment: 'Dinero en caja al abrir' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Dinero contado en caja al cerrar' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "closingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Total de ventas durante la sesión' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "totalSales", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Ventas calculadas en efectivo' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "calculatedCash", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Ventas calculadas con tarjeta' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "calculatedCard", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Ventas calculadas con otros métodos' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "calculatedOther", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Diferencia entre contado y calculado' }),
    __metadata("design:type", Number)
], CashierSession.prototype, "difference", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], CashierSession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CashierSession.prototype, "updatedAt", void 0);
exports.CashierSession = CashierSession = __decorate([
    (0, typeorm_1.Entity)('cashier_sessions')
], CashierSession);
//# sourceMappingURL=cashier-session.entity.js.map