"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let LogsService = LogsService_1 = class LogsService {
    constructor() {
        this.logger = new common_1.Logger(LogsService_1.name);
        this.logsDir = path.join(process.cwd(), 'logs');
    }
    async getLogFiles() {
        try {
            if (!fs.existsSync(this.logsDir)) {
                this.logger.warn(`El directorio de logs no existe en: ${this.logsDir}`);
                return [];
            }
            const files = await fs.promises.readdir(this.logsDir);
            return files.filter(file => file.endsWith('.log')).sort().reverse();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('No se pudo leer el directorio de logs.');
        }
    }
    async getLogContent(fileName, lines = 200) {
        const filePath = path.join(this.logsDir, fileName);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException(`El archivo de log '${fileName}' no existe.`);
        }
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return data.split('\n').slice(-lines).join('\n');
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = LogsService_1 = __decorate([
    (0, common_1.Injectable)()
], LogsService);
//# sourceMappingURL=logs.service.js.map