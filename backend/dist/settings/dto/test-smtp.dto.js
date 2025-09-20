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
exports.TestSmtpDto = void 0;
const class_validator_1 = require("class-validator");
class TestSmtpDto {
}
exports.TestSmtpDto = TestSmtpDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Debe proporcionar un correo electrónico de destinatario válido.' }),
    (0, class_validator_1.IsNotEmpty)({
        message: 'El correo electrónico del destinatario no puede estar vacío.',
    }),
    __metadata("design:type", String)
], TestSmtpDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El host SMTP debe ser una cadena de texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El host SMTP no puede estar vacío.' }),
    __metadata("design:type", String)
], TestSmtpDto.prototype, "host", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'El puerto SMTP debe ser un número entero.' }),
    (0, class_validator_1.Min)(1, { message: 'El puerto SMTP debe ser un número válido (1-65535).' }),
    (0, class_validator_1.Max)(65535, { message: 'El puerto SMTP debe ser un número válido (1-65535).' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El puerto SMTP no puede estar vacío.' }),
    __metadata("design:type", Number)
], TestSmtpDto.prototype, "port", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El usuario SMTP debe ser una cadena de texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El usuario SMTP no puede estar vacío.' }),
    __metadata("design:type", String)
], TestSmtpDto.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La contraseña SMTP debe ser una cadena de texto.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestSmtpDto.prototype, "pass", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'El campo "secure" (SSL/TLS) debe ser un valor booleano.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TestSmtpDto.prototype, "secure", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre de la aplicación debe ser una cadena de texto.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestSmtpDto.prototype, "appName", void 0);
//# sourceMappingURL=test-smtp.dto.js.map