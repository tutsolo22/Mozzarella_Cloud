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
const product_entity_1 = require("./entities/product.entity");
let ProductCategoriesService = class ProductCategoriesService {
    constructor(categoryRepository, productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }
    create(createDto, tenantId) {
        const category = this.categoryRepository.create({ ...createDto, tenantId });
        return this.categoryRepository.save(category);
    }
    findAll(tenantId, includeDeleted = false) {
        const where = { tenantId };
        return this.categoryRepository.find({ where, order: { position: 'ASC' }, withDeleted: includeDeleted });
    }
    async findOne(id, tenantId) {
        const category = await this.categoryRepository.findOne({ where: { id, tenantId }, withDeleted: true });
        if (!category) {
            throw new common_1.NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
        }
        return category;
    }
    async update(id, updateDto, tenantId) {
        await this.findOne(id, tenantId);
        const category = await this.categoryRepository.preload({
            id,
            ...updateDto,
        });
        return this.categoryRepository.save(category);
    }
    async remove(id, tenantId) {
        const category = await this.findOne(id, tenantId);
        const productCount = await this.productRepository.count({
            where: { category: { id: id } },
        });
        if (productCount > 0) {
            throw new common_1.ConflictException(`No se puede eliminar la categoría "${category.name}" porque tiene ${productCount} productos asociados.`);
        }
        const result = await this.categoryRepository.softDelete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
        }
    }
    async restore(id, tenantId) {
        const result = await this.categoryRepository.restore({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
        }
    }
    async reorder(orderedIds, tenantId) {
        const queryRunner = this.categoryRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (let i = 0; i < orderedIds.length; i++) {
                await queryRunner.manager.update(product_category_entity_1.ProductCategory, { id: orderedIds[i], tenantId }, { position: i });
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ProductCategoriesService = ProductCategoriesService;
exports.ProductCategoriesService = ProductCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_category_entity_1.ProductCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductCategoriesService);
//# sourceMappingURL=product-categories.service.js.map