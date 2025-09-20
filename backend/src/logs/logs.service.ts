import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs');

  async getLogFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.logsDir)) {
        this.logger.warn(`El directorio de logs no existe en: ${this.logsDir}`);
        return [];
      }
      const files = await fs.promises.readdir(this.logsDir);
      return files.filter(file => file.endsWith('.log')).sort().reverse();
    } catch (error) {
      throw new InternalServerErrorException('No se pudo leer el directorio de logs.');
    }
  }

  async getLogContent(fileName: string, lines: number = 200): Promise<string> {
    const filePath = path.join(this.logsDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`El archivo de log '${fileName}' no existe.`);
    }

    const data = await fs.promises.readFile(filePath, 'utf-8');
    return data.split('\n').slice(-lines).join('\n');
  }
}