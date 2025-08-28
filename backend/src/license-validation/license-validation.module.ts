import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { License } from '../licenses/entities/license.entity';
import { LicenseValidationService } from './license-validation.service';
import { LicenseValidationController } from './license-validation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([License]),
    // Este servicio necesita verificar el JWT de la licencia, por lo que necesita el mismo secreto.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LicenseValidationService],
  controllers: [LicenseValidationController],
})
export class LicenseValidationModule {}