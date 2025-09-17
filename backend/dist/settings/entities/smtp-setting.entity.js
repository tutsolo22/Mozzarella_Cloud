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
exports.SmtpSetting = void 0;
const typeorm_1 = require("typeorm");
let SmtpSetting = class SmtpSetting {
};
exports.SmtpSetting = SmtpSetting;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'int', default: 1, unique: true }),
    __metadata("design:type", Number)
], SmtpSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SmtpSetting.prototype, "host", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SmtpSetting.prototype, "port", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SmtpSetting.prototype, "secure", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SmtpSetting.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, select: false }),
    __metadata("design:type", String)
], SmtpSetting.prototype, "pass", void 0);
exports.SmtpSetting = SmtpSetting = __decorate([
    (0, typeorm_1.Entity)()
], SmtpSetting);
//# sourceMappingURL=smtp-setting.entity.js.map