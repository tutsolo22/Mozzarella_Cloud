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
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
require("multer");
let FilesService = FilesService_1 = class FilesService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FilesService_1.name);
        this.baseUploadPath = (0, path_1.join)(process.cwd(), 'public', 'uploads');
    }
    async ensureTenantDirectoryExists(tenantId) {
        const tenantPath = (0, path_1.join)(this.baseUploadPath, tenantId);
        if (!(0, fs_1.existsSync)(tenantPath)) {
            try {
                await (0, promises_1.mkdir)(tenantPath, { recursive: true });
                this.logger.log(`Created uploads directory for tenant at ${tenantPath}`);
            }
            catch (error) {
                this.logger.error(`Failed to create uploads directory: ${tenantPath}`, error.stack);
                throw new common_1.InternalServerErrorException('Could not create uploads directory');
            }
        }
        return tenantPath;
    }
    async uploadPublicFile(file, tenantId) {
        const tenantUploadPath = await this.ensureTenantDirectoryExists(tenantId);
        const fileExtension = file.originalname.split('.').pop();
        const filename = `${(0, uuid_1.v4)()}.${fileExtension}`;
        const filePath = (0, path_1.join)(tenantUploadPath, filename);
        await (0, promises_1.writeFile)(filePath, file.buffer);
        const baseUrl = this.configService.get('API_URL', 'http://localhost:3000');
        const url = `${baseUrl}/uploads/${tenantId}/${filename}`;
        return { url };
    }
    async deletePublicFile(filename, tenantId) {
        const tenantUploadPath = (0, path_1.join)(this.baseUploadPath, tenantId);
        const filePath = (0, path_1.join)(tenantUploadPath, filename);
        try {
            if ((0, fs_1.existsSync)(filePath)) {
                await (0, promises_1.unlink)(filePath);
                this.logger.log(`Deleted file: ${filePath}`);
            }
            else {
                this.logger.warn(`File not found for deletion: ${filePath}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
            throw new common_1.InternalServerErrorException('Could not delete file');
        }
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map