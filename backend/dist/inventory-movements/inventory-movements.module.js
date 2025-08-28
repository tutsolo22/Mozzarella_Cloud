"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryMovementsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inventory_movement_entity_1 = require("./entities/inventory-movement.entity");
const inventory_movements_service_1 = require("./inventory-movements.service");
let InventoryMovementsModule = class InventoryMovementsModule {
};
exports.InventoryMovementsModule = InventoryMovementsModule;
exports.InventoryMovementsModule = InventoryMovementsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([inventory_movement_entity_1.InventoryMovement])],
        providers: [inventory_movements_service_1.InventoryMovementsService],
        exports: [inventory_movements_service_1.InventoryMovementsService],
    })
], InventoryMovementsModule);
//# sourceMappingURL=inventory-movements.module.js.map