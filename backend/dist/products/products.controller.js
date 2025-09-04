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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
require("multer");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const assign_ingredients_dto_1 = require("./dto/assign-ingredients.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para crear productos.');
        }
        return this.productsService.create(createProductDto, user.tenantId, user.locationId);
    }
    findAll(user, includeUnavailable) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para ver productos.');
        }
        return this.productsService.findAll(user.tenantId, user.locationId, includeUnavailable);
    }
    findOne(id, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        }
        return this.productsService.findOne(id, user.tenantId, user.locationId);
    }
    update(id, updateProductDto, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para actualizar productos.');
        }
        return this.productsService.update(id, updateProductDto, user.tenantId, user.locationId);
    }
    remove(id, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para eliminar productos.');
        }
        return this.productsService.disable(id, user.tenantId, user.locationId);
    }
    restore(id, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para habilitar productos.');
        }
        return this.productsService.enable(id, user.tenantId, user.locationId);
    }
    uploadImage(id, file, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        }
        return this.productsService.updateImage(id, file, user.tenantId, user.locationId);
    }
    getIngredients(id, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        }
        return this.productsService.getIngredients(id, user.tenantId, user.locationId);
    }
    assignIngredients(id, assignIngredientsDto, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        }
        return this.productsService.assignIngredients(id, assignIngredientsDto, user.tenantId, user.locationId);
    }
    async exportProducts(user, res) {
        const csvData = await this.productsService.exportProductsToCsv(user.tenantId);
        res.header('Content-Type', 'text/csv');
        res.attachment('products.csv');
        return res.send(csvData);
    }
    async importProducts(file, user) {
        if (!file) {
            throw new common_1.BadRequestException('No se ha subido ningún archivo.');
        }
        return this.productsService.importProductsFromCsv(file, user.tenantId, user.locationId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager, role_enum_1.RoleEnum.Kitchen),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('includeUnavailable', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager, role_enum_1.RoleEnum.Kitchen),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(':id/image'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
            new common_1.FileTypeValidator({ fileType: /image\/(jpeg|png)/ }),
        ],
        fileIsRequired: true,
    }))),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)(':id/ingredients'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager, role_enum_1.RoleEnum.Kitchen),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getIngredients", null);
__decorate([
    (0, common_1.Post)(':id/ingredients'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_ingredients_dto_1.AssignIngredientsDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "assignIngredients", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "exportProducts", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "importProducts", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map