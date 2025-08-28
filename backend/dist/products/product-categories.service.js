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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_category_entity_1 = require("./entities/product-category.entity");
let ProductCategoriesService = class ProductCategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    create(createDto) {
        const category = this.categoryRepository.create(createDto);
        return this.categoryRepository.save(category);
    }
    findAll() {
        return this.categoryRepository.find();
    }
    async update(id, updateDto) {
        const category = await this.categoryRepository.preload({
            id,
            ...updateDto,
        });
        if (!category) {
            throw new common_1.NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
        }
        return this.categoryRepository.save(category);
    }
    async remove(id) {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
        }
    }
};
exports.ProductCategoriesService = ProductCategoriesService;
exports.ProductCategoriesService = ProductCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_category_entity_1.ProductCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductCategoriesService);
//# sourceMappingURL=product-categories.service.js.map