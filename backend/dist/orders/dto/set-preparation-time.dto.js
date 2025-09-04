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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPreparationTimeDto = void 0;
const class_validator_1 = require("class-validator");
class SetPreparationTimeDto {
}
exports.SetPreparationTimeDto = SetPreparationTimeDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El tiempo de preparación debe ser un número entero.' }),
    (0, class_validator_1.IsPositive)({ message: 'El tiempo de preparación debe ser positivo.' }),
    (0, class_validator_1.Max)(120, { message: 'El tiempo de preparación no puede exceder los 120 minutos.' }),
    __metadata("design:type", Number)
], SetPreparationTimeDto.prototype, "preparationTimeMinutes", void 0);
//# sourceMappingURL=set-preparation-time.dto.js.map