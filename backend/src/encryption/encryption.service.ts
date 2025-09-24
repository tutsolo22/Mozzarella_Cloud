import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly ivLength = 16;
  private readonly algorithm = 'aes-256-gcm';
  private readonly logger = new Logger(EncryptionService.name);

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length !== 32) {
      this.logger.error('ENCRYPTION_KEY no está definida o no tiene 32 caracteres. La encriptación de datos fallará.');
      throw new InternalServerErrorException('Error de configuración de seguridad del servidor.');
    }
    this.key = Buffer.from(encryptionKey, 'utf-8');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('hex');
  }

  decrypt(hash: string): string {
    const data = Buffer.from(hash, 'hex');
    const iv = data.slice(0, this.ivLength);
    const authTag = data.slice(this.ivLength, this.ivLength + 16);
    const encrypted = data.slice(this.ivLength + 16);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}