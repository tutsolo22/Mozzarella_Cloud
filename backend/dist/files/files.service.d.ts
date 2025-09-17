import { ConfigService } from '@nestjs/config';
import 'multer';
export declare class FilesService {
    private readonly configService;
    private readonly logger;
    private readonly baseUploadPath;
    constructor(configService: ConfigService);
    private ensureTenantDirectoryExists;
    uploadPublicFile(file: Express.Multer.File, tenantId: string): Promise<{
        url: string;
    }>;
    deletePublicFile(filename: string, tenantId: string): Promise<void>;
}
