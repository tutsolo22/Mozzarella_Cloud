import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/roles/entities/permission.entity';
import { SettingsModule } from '../settings/settings.module';
import { LicensingModule } from '../licenses/licenses.module';

@Module({
  imports: [
    ConfigModule, // Importar ConfigModule para que ConfigService esté disponible para inyección.
    TypeOrmModule.forFeature([User, Tenant, Role, Permission]),
    PassportModule,
    SettingsModule, // Importamos SettingsModule para que AuthService pueda inyectar SettingsService
    LicensingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}