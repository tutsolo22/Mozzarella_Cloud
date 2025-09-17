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
const tenant_entity_1 = require("../../tenants/entities/tenant.entity");
const location_entity_1 = require("../../locations/entities/location.entity");
const product_ingredient_entity_1 = require("../../products/entities/product-ingredient.entity");
const recipe_item_entity_1 = require("../../products/entities/recipe-item.entity");
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
], Ingredient.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Ingredient.prototype, "stockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Ingredient.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Ingredient.prototype, "costPerUnit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Ingredient.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ingredient.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => location_entity_1.Location, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'locationId' }),
    __metadata("design:type", location_entity_1.Location)
], Ingredient.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_ingredient_entity_1.ProductIngredient, (productIngredient) => productIngredient.ingredient),
    __metadata("design:type", Array)
], Ingredient.prototype, "productIngredients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => recipe_item_entity_1.RecipeItem, (recipeItem) => recipeItem.ingredient),
    __metadata("design:type", Array)
], Ingredient.prototype, "recipeItems", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ingredient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Ingredient.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Ingredient.prototype, "deletedAt", void 0);
exports.Ingredient = Ingredient = __decorate([
    (0, typeorm_1.Entity)('ingredients'),
    (0, typeorm_1.Index)(['tenantId', 'locationId', 'name'], { unique: true, where: '"deletedAt" IS NULL' })
], Ingredient);
//# sourceMappingURL=ingredient.entity.js.map