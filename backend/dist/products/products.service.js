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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const files_service_1 = require("../files/files.service");
const product_ingredient_entity_1 = require("./entities/product-ingredient.entity");
const ingredient_entity_1 = require("../ingredients/entities/ingredient.entity");
const csv_service_1 = require("../csv/csv.service");
const product_category_entity_1 = require("./entities/product-category.entity");
const path = require("path");
require("multer");
let ProductsService = ProductsService_1 = class ProductsService {
    constructor(productRepository, productIngredientRepository, ingredientRepository, categoryRepository, filesService, csvService, dataSource) {
        this.productRepository = productRepository;
        this.productIngredientRepository = productIngredientRepository;
        this.ingredientRepository = ingredientRepository;
        this.categoryRepository = categoryRepository;
        this.filesService = filesService;
        this.csvService = csvService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ProductsService_1.name);
    }
    create(dto, tenantId, locationId) {
        const product = this.productRepository.create({
            ...dto,
            tenantId,
            locationId,
        });
        return this.productRepository.save(product);
    }
    findAll(tenantId, locationId, includeUnavailable) {
        const where = {
            tenantId,
            locationId,
        };
        if (!includeUnavailable) {
            where.isAvailable = true;
        }
        return this.productRepository.find({
            where,
            relations: ['category', 'preparationZone'],
            order: { name: 'ASC' },
        });
    }
    async findOne(id, tenantId, locationId) {
        const product = await this.productRepository.findOne({
            where: { id, tenantId, locationId },
            relations: ['category', 'preparationZone'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID #${id} no encontrado.`);
        }
        return product;
    }
    async update(id, dto, tenantId, locationId) {
        const product = await this.productRepository.preload({
            id,
            tenantId,
            locationId,
            ...dto,
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID #${id} no encontrado.`);
        }
        return this.productRepository.save(product);
    }
    async disable(id, tenantId, locationId) {
        const result = await this.productRepository.softDelete({ id, tenantId, locationId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Producto con ID #${id} no encontrado.`);
        }
    }
    async enable(id, tenantId, locationId) {
        const result = await this.productRepository.restore({ id, tenantId, locationId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Producto con ID #${id} no encontrado.`);
        }
    }
    async updateImage(id, file, tenantId, locationId) {
        const product = await this.findOne(id, tenantId, locationId);
        if (product.imageUrl) {
            try {
                const oldFileKey = path.basename(product.imageUrl);
                await this.filesService.deletePublicFile(oldFileKey, tenantId);
            }
            catch (error) {
                this.logger.warn(`No se pudo eliminar la imagen anterior del producto: ${error.message}`);
            }
        }
        const { url } = await this.filesService.uploadPublicFile(file, tenantId);
        return this.update(id, { imageUrl: url }, tenantId, locationId);
    }
    async getIngredients(id, tenantId, locationId) {
        const product = await this.productRepository.findOne({
            where: { id, tenantId, locationId },
            relations: ['ingredients', 'ingredients.ingredient'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID "${id}" no encontrado.`);
        }
        return product.ingredients;
    }
    async assignIngredients(id, assignIngredientsDto, tenantId, locationId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOneBy(product_entity_1.Product, { id, tenantId, locationId });
            if (!product)
                throw new common_1.NotFoundException(`Producto con ID "${id}" no encontrado.`);
            await queryRunner.manager.delete(product_ingredient_entity_1.ProductIngredient, { productId: id });
            const { ingredients } = assignIngredientsDto;
            if (ingredients && ingredients.length > 0) {
                const ingredientIds = ingredients.map(i => i.ingredientId);
                const availableIngredients = await queryRunner.manager.findBy(ingredient_entity_1.Ingredient, { id: (0, typeorm_2.In)(ingredientIds), tenantId, locationId });
                if (availableIngredients.length !== ingredientIds.length) {
                    throw new common_1.BadRequestException('Uno o más ingredientes no existen o no pertenecen a esta sucursal.');
                }
                const productIngredients = ingredients.map(item => queryRunner.manager.create(product_ingredient_entity_1.ProductIngredient, {
                    productId: id,
                    ingredientId: item.ingredientId,
                    quantityRequired: item.quantityRequired,
                }));
                await queryRunner.manager.save(productIngredients);
                product.recipeIsSet = true;
            }
            else {
                product.recipeIsSet = false;
            }
            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al asignar ingredientes al producto ${id}:`, error);
            throw new common_1.InternalServerErrorException('Error al asignar ingredientes.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async exportProductsToCsv(tenantId) {
        const products = await this.productRepository.find({
            where: { tenantId },
            relations: ['category'],
            order: { category: { name: 'ASC' }, name: 'ASC' },
        });
        const data = products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            isAvailable: p.isAvailable,
            category: p.category?.name || '',
            weightKg: p.weightKg,
            volumeM3: p.volumeM3,
        }));
        return this.csvService.stringify(data, { header: true });
    }
    async importProductsFromCsv(file, tenantId, locationId) {
        const results = { created: 0, updated: 0, errors: [] };
        const parsedData = await this.csvService.parse(file.buffer);
        for (const row of parsedData) {
            try {
                const { name, description, price, isAvailable, category: categoryName, weightKg, volumeM3 } = row;
                if (!name || !price) {
                    results.errors.push(`Fila ignorada: faltan 'name' o 'price'. Fila: ${JSON.stringify(row)}`);
                    continue;
                }
                let category = null;
                if (categoryName) {
                    category = await this.categoryRepository.findOneBy({ name: categoryName, tenantId });
                    if (!category) {
                        category = await this.categoryRepository.save(this.categoryRepository.create({ name: categoryName, tenantId }));
                    }
                }
                const productData = { name, description, price: parseFloat(price), isAvailable: isAvailable ? ['true', '1'].includes(isAvailable.toLowerCase()) : true, tenantId, locationId, categoryId: category?.id, weightKg: weightKg ? parseFloat(weightKg) : 0, volumeM3: volumeM3 ? parseFloat(volumeM3) : 0 };
                const existingByName = await this.productRepository.findOneBy({ name, tenantId, locationId });
                if (existingByName) {
                    await this.productRepository.update(existingByName.id, productData);
                    results.updated++;
                }
                else {
                    await this.productRepository.save(this.productRepository.create(productData));
                    results.created++;
                }
            }
            catch (error) {
                results.errors.push(`Error procesando fila ${JSON.stringify(row)}: ${error.message}`);
            }
        }
        return results;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_ingredient_entity_1.ProductIngredient)),
    __param(2, (0, typeorm_1.InjectRepository)(ingredient_entity_1.Ingredient)),
    __param(3, (0, typeorm_1.InjectRepository)(product_category_entity_1.ProductCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        files_service_1.FilesService,
        csv_service_1.CsvService,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map