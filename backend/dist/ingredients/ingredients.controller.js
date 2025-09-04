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
exports.IngredientsController = void 0;
const common_1 = require("@nestjs/common");
const ingredients_service_1 = require("./ingredients.service");
const create_ingredient_dto_1 = require("./dto/create-ingredient.dto");
const purchase_ingredients_dto_1 = require("./dto/purchase-ingredients.dto");
const register_waste_dto_1 = require("./dto/register-waste.dto");
const adjust_stock_dto_1 = require("./dto/adjust-stock.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let IngredientsController = class IngredientsController {
    constructor(ingredientsService) {
        this.ingredientsService = ingredientsService;
    }
    create(createIngredientDto, user) {
        return this.ingredientsService.create(createIngredientDto, user.tenantId);
    }
    findAll(user) {
        return this.ingredientsService.findAll(user.tenantId);
    }
    purchase(purchaseDto, user) {
        return this.ingredientsService.purchase(purchaseDto, user.userId, user.tenantId);
    }
    registerWaste(wasteDto, user) {
        return this.ingredientsService.registerWaste(wasteDto, user.userId, user.tenantId);
    }
    adjustStock(adjustDto, user) {
        return this.ingredientsService.adjustStock(adjustDto, user.userId, user.tenantId);
    }
    getMovementHistory(id, user) {
        return this.ingredientsService.getMovementHistory(id, user.tenantId);
    }
};
exports.IngredientsController = IngredientsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ingredient_dto_1.CreateIngredientDto, Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager, role_enum_1.RoleEnum.Kitchen),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('purchase'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_ingredients_dto_1.PurchaseIngredientsDto, Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "purchase", null);
__decorate([
    (0, common_1.Post)('waste'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_waste_dto_1.RegisterWasteDto, Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "registerWaste", null);
__decorate([
    (0, common_1.Post)('adjust-stock'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adjust_stock_dto_1.AdjustStockDto, Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)(':id/movements'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "getMovementHistory", null);
exports.IngredientsController = IngredientsController = __decorate([
    (0, common_1.Controller)('ingredients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ingredients_service_1.IngredientsService])
], IngredientsController);
//# sourceMappingURL=ingredients.controller.js.map