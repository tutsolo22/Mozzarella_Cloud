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
exports.SalesForecastQueryDto = exports.ForecastPeriod = void 0;
const class_validator_1 = require("class-validator");
var ForecastPeriod;
(function (ForecastPeriod) {
    ForecastPeriod["Daily"] = "daily";
    ForecastPeriod["Weekly"] = "weekly";
})(ForecastPeriod || (exports.ForecastPeriod = ForecastPeriod = {}));
class SalesForecastQueryDto {
    constructor() {
        this.period = ForecastPeriod.Weekly;
        this.duration = '4';
    }
}
exports.SalesForecastQueryDto = SalesForecastQueryDto;
__decorate([
    (0, class_validator_1.IsEnum)(ForecastPeriod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SalesForecastQueryDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SalesForecastQueryDto.prototype, "duration", void 0);
//# sourceMappingURL=sales-forecast-query.dto.js.map