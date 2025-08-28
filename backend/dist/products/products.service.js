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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_category_entity_1 = require("./entities/product-category.entity");
const ingredient_entity_1 = require("../ingredients/entities/ingredient.entity");
const product_ingredient_entity_1 = require("./entities/product-ingredient.entity");
let ProductsService = class ProductsService {
    constructor(productRepository, categoryRepository, productIngredientRepository, ingredientRepository, dataSource) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productIngredientRepository = productIngredientRepository;
        this.ingredientRepository = ingredientRepository;
        this.dataSource = dataSource;
    }
    async create(createProductDto) {
        const { categoryId, ...productData } = createProductDto;
        const category = await this.categoryRepository.findOneBy({ id: categoryId });
        if (!category) {
            throw new common_1.NotFoundException(`La categoría con ID "${categoryId}" no fue encontrada.`);
        }
        const newProduct = this.productRepository.create({ ...productData, category });
        return this.productRepository.save(newProduct);
    }
    findAll(includeUnavailable = false) {
        const where = {};
        if (!includeUnavailable) {
            where.isAvailable = true;
        }
        return this.productRepository.find({
            where,
            relations: ['category'],
        });
    }
    async update(id, updateProductDto) {
        const { categoryId, ...productData } = updateProductDto;
        const product = await this.productRepository.preload({
            id,
            ...productData,
        });
        if (!product) {
            throw new common_1.NotFoundException(`El producto con ID "${id}" no fue encontrado.`);
        }
        if (categoryId) {
            const category = await this.categoryRepository.findOneBy({ id: categoryId });
            if (!category) {
                throw new common_1.NotFoundException(`La categoría con ID "${categoryId}" no fue encontrada.`);
            }
            product.category = category;
        }
        return this.productRepository.save(product);
    }
    async remove(id) {
        const result = await this.productRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`El producto con ID "${id}" no fue encontrado.`);
        }
    }
    async assignIngredients(productId, assignIngredientsDto) {
        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) {
            throw new common_1.NotFoundException(`El producto con ID "${productId}" no fue encontrado.`);
        }
        const { ingredients } = assignIngredientsDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(product_ingredient_entity_1.ProductIngredient, { productId });
            if (ingredients && ingredients.length > 0) {
                const recipeEntries = ingredients.map((item) => queryRunner.manager.create(product_ingredient_entity_1.ProductIngredient, {
                    productId,
                    ingredientId: item.ingredientId,
                    quantityRequired: item.quantityRequired,
                }));
                await queryRunner.manager.save(recipeEntries);
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    getIngredients(productId) {
        return this.productIngredientRepository.find({ where: { productId } });
    }
    async getProductionEstimate(productId) {
        const recipe = await this.productIngredientRepository.find({
            where: { productId },
            relations: ['ingredient'],
        });
        if (recipe.length === 0) {
            return {
                estimatedUnits: Infinity,
                limitingIngredient: 'N/A',
            };
        }
        let minPossibleUnits = Infinity;
        let limitingIngredient = 'N/A';
        for (const recipeItem of recipe) {
            if (!recipeItem.ingredient) {
                throw new common_1.InternalServerErrorException(`El ingrediente con ID ${recipeItem.ingredientId} no fue encontrado en la receta.`);
            }
            const possibleUnits = Math.floor(Number(recipeItem.ingredient.stockQuantity) / Number(recipeItem.quantityRequired));
            if (possibleUnits < minPossibleUnits) {
                minPossibleUnits = possibleUnits;
                limitingIngredient = recipeItem.ingredient.name;
            }
        }
        return { estimatedUnits: minPossibleUnits, limitingIngredient };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_category_entity_1.ProductCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(product_ingredient_entity_1.ProductIngredient)),
    __param(3, (0, typeorm_1.InjectRepository)(ingredient_entity_1.Ingredient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map