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
exports.RecipeItem = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const ingredient_entity_1 = require("../../ingredients/entities/ingredient.entity");
let RecipeItem = class RecipeItem {
};
exports.RecipeItem = RecipeItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RecipeItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RecipeItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RecipeItem.prototype, "ingredientId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], RecipeItem.prototype, "quantityRequired", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.recipeItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], RecipeItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ingredient_entity_1.Ingredient, (ingredient) => ingredient.recipeItems, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ingredientId' }),
    __metadata("design:type", ingredient_entity_1.Ingredient)
], RecipeItem.prototype, "ingredient", void 0);
exports.RecipeItem = RecipeItem = __decorate([
    (0, typeorm_1.Entity)('recipe_items'),
    (0, typeorm_1.Index)(['productId', 'ingredientId'], { unique: true })
], RecipeItem);
//# sourceMappingURL=recipe-item.entity.js.map