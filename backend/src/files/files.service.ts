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
  private readonly uploadPath = join(process.cwd(), 'public', 'uploads');

  constructor(
    private readonly configService: ConfigService
  ) {
    this.ensureUploadsDirectoryExists();
  }

  private async ensureUploadsDirectoryExists() {
    if (!existsSync(this.uploadPath)) {
      try {
        await mkdir(this.uploadPath, { recursive: true });
        this.logger.log(`Created uploads directory at ${this.uploadPath}`);
      } catch (error) {
        this.logger.error(`Failed to create uploads directory: ${this.uploadPath}`, error.stack);
        throw new InternalServerErrorException('Could not create uploads directory');
      }
    }
  }

  async uploadPublicFile(file: Express.Multer.File): Promise<{ url: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uuid()}.${fileExtension}`;
    const filePath = join(this.uploadPath, filename);

    await writeFile(filePath, file.buffer);
    const baseUrl = this.configService.get<string>('API_URL', 'http://localhost:3000');
    const url = `${baseUrl}/uploads/${filename}`;
    return { url };
  }
}