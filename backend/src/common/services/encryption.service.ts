import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;
  private readonly ivLength = 16; // For AES, this is always 16
  private readonly algorithm = 'aes-256-gcm';

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length !== 32) {
      this.logger.error('ENCRYPTION_KEY no está definida o no tiene 32 caracteres. La encriptación fallará.');
      throw new InternalServerErrorException('La clave de encriptación no está configurada correctamente.');
    }
    this.key = Buffer.from(encryptionKey, 'utf-8');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Devolvemos todo junto en un formato manejable: iv:authTag:encryptedContent
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(hash: string): string {
    try {
      const parts = hash.split(':');
      if (parts.length !== 3) {
        throw new Error('Formato de hash de encriptación inválido.');
      }
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedText = Buffer.from(parts[2], 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Fallo al desencriptar. El hash podría estar corrupto o la clave de encriptación cambió.', error.stack);
      throw new InternalServerErrorException('No se pudo desencriptar el dato.');
    }
  }
}