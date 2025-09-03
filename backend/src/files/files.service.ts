import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import 'multer';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly baseUploadPath = join(process.cwd(), 'public', 'uploads');

  constructor(
    private readonly configService: ConfigService
  ) {}

  private async ensureTenantDirectoryExists(tenantId: string): Promise<string> {
    const tenantPath = join(this.baseUploadPath, tenantId);
    if (!existsSync(tenantPath)) {
      try {
        await mkdir(tenantPath, { recursive: true });
        this.logger.log(`Created uploads directory for tenant at ${tenantPath}`);
      } catch (error) {
        this.logger.error(`Failed to create uploads directory: ${tenantPath}`, error.stack);
        throw new InternalServerErrorException('Could not create uploads directory');
      }
    }
    return tenantPath;
  }

  async uploadPublicFile(file: Express.Multer.File, tenantId: string): Promise<{ url: string }> {
    const tenantUploadPath = await this.ensureTenantDirectoryExists(tenantId);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uuid()}.${fileExtension}`;
    const filePath = join(tenantUploadPath, filename);

    await writeFile(filePath, file.buffer);
    const baseUrl = this.configService.get<string>('API_URL', 'http://localhost:3000');
    const url = `${baseUrl}/uploads/${tenantId}/${filename}`;
    return { url };
  }
}