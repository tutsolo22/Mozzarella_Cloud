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
exports.ProductCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const product_categories_service_1 = require("./product-categories.service");
const create_product_category_dto_1 = require("./dto/create-product-category.dto");
const reorder_categories_dto_1 = require("./dto/reorder-categories.dto");
const update_product_category_dto_1 = require("./dto/update-product-category.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let ProductCategoriesController = class ProductCategoriesController {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    create(createDto, user) {
        return this.categoriesService.create(createDto, user.tenantId);
    }
    findAll(user, includeDeleted = false) {
        return this.categoriesService.findAll(user.tenantId, includeDeleted);
    }
    update(id, updateDto, user) {
        return this.categoriesService.update(id, updateDto, user.tenantId);
    }
    remove(id, user) {
        return this.categoriesService.remove(id, user.tenantId);
    }
    restore(id, user) {
        return this.categoriesService.restore(id, user.tenantId);
    }
    reorder(reorderDto, user) {
        return this.categoriesService.reorder(reorderDto.orderedIds, user.tenantId);
    }
};
exports.ProductCategoriesController = ProductCategoriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_category_dto_1.CreateProductCategoryDto, Object]),
    __metadata("design:returntype", void 0)
], ProductCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('includeDeleted', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], ProductCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_category_dto_1.UpdateProductCategoryDto, Object]),
    __metadata("design:returntype", void 0)
], ProductCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductCategoriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductCategoriesController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_categories_dto_1.ReorderCategoriesDto, Object]),
    __metadata("design:returntype", void 0)
], ProductCategoriesController.prototype, "reorder", null);
exports.ProductCategoriesController = ProductCategoriesController = __decorate([
    (0, common_1.Controller)('product-categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __metadata("design:paramtypes", [product_categories_service_1.ProductCategoriesService])
], ProductCategoriesController);
//# sourceMappingURL=product-categories.controller.js.map