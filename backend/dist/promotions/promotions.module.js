"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const promotions_service_1 = require("./promotions.service");
const promotions_controller_1 = require("./promotions.controller");
const promotion_entity_1 = require("./entities/promotion.entity");
const product_entity_1 = require("../products/entities/product.entity");
const files_module_1 = require("../files/files.module");
const location_entity_1 = require("../locations/entities/location.entity");
const public_promotions_controller_1 = require("./public-promotions.controller");
let PromotionsModule = class PromotionsModule {
};
exports.PromotionsModule = PromotionsModule;
exports.PromotionsModule = PromotionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([promotion_entity_1.Promotion, product_entity_1.Product, location_entity_1.Location]), files_module_1.FilesModule],
        controllers: [promotions_controller_1.PromotionsController, public_promotions_controller_1.PublicPromotionsController],
        providers: [promotions_service_1.PromotionsService],
    })
], PromotionsModule);
//# sourceMappingURL=promotions.module.js.map