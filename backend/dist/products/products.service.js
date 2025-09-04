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
const files_service_1 = require("../files/files.service");
require("multer");
const recipe_item_entity_1 = require("./entities/recipe-item.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
let ProductsService = class ProductsService {
    constructor(productRepository, categoryRepository, recipeItemRepository, orderItemRepository, dataSource, filesService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.recipeItemRepository = recipeItemRepository;
        this.orderItemRepository = orderItemRepository;
        this.dataSource = dataSource;
        this.filesService = filesService;
    }
    async create(createProductDto, tenantId, locationId) {
        const { categoryId, ...rest } = createProductDto;
        const category = await this.categoryRepository.findOneBy({ id: categoryId });
        if (!category) {
            throw new common_1.NotFoundException(`Categoría con ID "${categoryId}" no encontrada.`);
        }
        const product = this.productRepository.create({
            ...rest,
            tenantId,
            locationId,
            category,
        });
        return this.productRepository.save(product);
    }
    findAll(tenantId, locationId, includeInactive = false) {
        const where = { tenantId, locationId };
        return this.productRepository.find({
            where,
            relations: ['category'],
            order: { name: 'ASC' },
            withDeleted: includeInactive,
        });
    }
    async findOne(id, tenantId, locationId) {
        const product = await this.productRepository.findOne({
            where: { id, tenantId, locationId },
            relations: ['category'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID "${id}" no encontrado.`);
        }
        return product;
    }
    async update(id, updateProductDto, tenantId, locationId) {
        const product = await this.productRepository.preload({
            id,
            tenantId,
            locationId,
            ...updateProductDto,
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID "${id}" no encontrado.`);
        }
        return this.productRepository.save(product);
    }
    async disable(id, tenantId, locationId) {
        const product = await this.productRepository.findOneBy({ id, tenantId, locationId });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID "${id}" no encontrado.`);
        }
        const orderCount = await this.orderItemRepository.count({
            where: { productId: id },
        });
        if (orderCount > 0) {
            throw new common_1.ConflictException(`No se puede deshabilitar el producto "${product.name}" porque está asociado a ${orderCount} pedidos existentes.`);
        }
        const result = await this.productRepository.softDelete({ id, tenantId, locationId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Producto con ID "${id}" no encontrado o ya está deshabilitado.`);
        }
    }
    async enable(id, tenantId, locationId) {
        await this.productRepository.restore({ id, tenantId, locationId });
    }
    async updateImage(id, file, tenantId, locationId) {
        if (!file) {
            throw new common_1.BadRequestException('No se ha proporcionado ningún archivo.');
        }
        const product = await this.findOne(id, tenantId, locationId);
        const { url } = await this.filesService.uploadPublicFile(file, `tenants/${tenantId}/products`);
        product.imageUrl = url;
        return this.productRepository.save(product);
    }
    async getIngredients(productId, tenantId, locationId) {
        await this.findOne(productId, tenantId, locationId);
        return this.recipeItemRepository.find({
            where: { productId },
            relations: ['ingredient'],
        });
    }
    async assignIngredients(productId, assignIngredientsDto, tenantId, locationId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOneBy(product_entity_1.Product, { id: productId, tenantId, locationId });
            if (!product) {
                throw new common_1.NotFoundException(`Producto con ID "${productId}" no encontrado en tu sucursal.`);
            }
            await queryRunner.manager.delete(recipe_item_entity_1.RecipeItem, { productId });
            if (assignIngredientsDto.ingredients && assignIngredientsDto.ingredients.length > 0) {
                const newRecipeItems = assignIngredientsDto.ingredients.map((item) => queryRunner.manager.create(recipe_item_entity_1.RecipeItem, { productId, ...item }));
                await queryRunner.manager.save(newRecipeItems);
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
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_category_entity_1.ProductCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(recipe_item_entity_1.RecipeItem)),
    __param(3, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        files_service_1.FilesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map