import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysService } from './api-keys.service';
import { ApiKey } from './entities/api-key.entity';
import { EncryptionModule } from '../common/encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    EncryptionModule,
  ],
  providers: [ApiKeysService],
  exports: [ApiKeysService], // Export service to be used in other modules
})
export class ApiKeysModule {}