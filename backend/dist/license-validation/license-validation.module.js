"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseValidationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const license_entity_1 = require("../licenses/entities/license.entity");
const license_validation_service_1 = require("./license-validation.service");
const license_validation_controller_1 = require("./license-validation.controller");
let LicenseValidationModule = class LicenseValidationModule {
};
exports.LicenseValidationModule = LicenseValidationModule;
exports.LicenseValidationModule = LicenseValidationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([license_entity_1.License]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [license_validation_service_1.LicenseValidationService],
        controllers: [license_validation_controller_1.LicenseValidationController],
    })
], LicenseValidationModule);
//# sourceMappingURL=license-validation.module.js.map