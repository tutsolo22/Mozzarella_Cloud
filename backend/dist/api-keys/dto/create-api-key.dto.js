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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateApiKeyDto = void 0;
const class_validator_1 = require("class-validator");
const api_key_entity_1 = require("../entities/api-key.entity");
class CreateApiKeyDto {
}
exports.CreateApiKeyDto = CreateApiKeyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(api_key_entity_1.ApiKeyServiceIdentifier),
    __metadata("design:type", typeof (_a = typeof api_key_entity_1.ApiKeyServiceIdentifier !== "undefined" && api_key_entity_1.ApiKeyServiceIdentifier) === "function" ? _a : Object)
], CreateApiKeyDto.prototype, "serviceIdentifier", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'La URL de la API debe ser una URL válida.' }),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "apiUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateApiKeyDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-api-key.dto.js.map