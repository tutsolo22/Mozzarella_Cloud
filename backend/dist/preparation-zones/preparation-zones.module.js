"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreparationZonesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const preparation_zone_entity_1 = require("./entities/preparation-zone.entity");
const preparation_zones_service_1 = require("./preparation-zones.service");
const preparation_zones_controller_1 = require("./preparation-zones.controller");
const product_entity_1 = require("../products/entities/product.entity");
let PreparationZonesModule = class PreparationZonesModule {
};
exports.PreparationZonesModule = PreparationZonesModule;
exports.PreparationZonesModule = PreparationZonesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([preparation_zone_entity_1.PreparationZone, product_entity_1.Product])],
        controllers: [preparation_zones_controller_1.PreparationZonesController],
        providers: [preparation_zones_service_1.PreparationZonesService],
    })
], PreparationZonesModule);
//# sourceMappingURL=preparation-zones.module.js.map