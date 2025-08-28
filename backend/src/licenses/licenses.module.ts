import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { License } from './entities/license.entity';
import { LicensingService } from './licensing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([License]),
    // El LicensingService usa JwtService para firmar la clave de licencia.
    // Debe usar el mismo secreto que el módulo de autenticación.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LicensingService],
  exports: [LicensingService],
})
export class LicensingModule {}