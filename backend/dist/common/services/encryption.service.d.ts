import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly logger;
    private readonly key;
    private readonly ivLength;
    private readonly algorithm;
    constructor(configService: ConfigService);
    encrypt(text: string): string;
    decrypt(hash: string): string;
}
