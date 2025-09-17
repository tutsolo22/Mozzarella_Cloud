"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvService = void 0;
const common_1 = require("@nestjs/common");
const Papa = require("papaparse");
let CsvService = class CsvService {
    parse(buffer) {
        const csvString = buffer.toString('utf-8');
        const result = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
        });
        if (result.errors.length > 0) {
            console.error('CSV parsing errors:', result.errors);
        }
        return result.data;
    }
    stringify(data, options) {
        return Papa.unparse(data, options);
    }
};
exports.CsvService = CsvService;
exports.CsvService = CsvService = __decorate([
    (0, common_1.Injectable)()
], CsvService);
//# sourceMappingURL=csv.service.js.map