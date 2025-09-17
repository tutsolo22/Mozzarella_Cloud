import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsGateway } from './notifications.gateway';
import { GeofencingModule } from '../geofencing/geofencing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UsersModule,
    // Importar JwtModule para que el Gateway pueda inyectar JwtService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    // Usamos forwardRef para romper la dependencia circular,
    // ya que GeofencingModule también importa NotificationsModule.
    forwardRef(() => GeofencingModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  // Exportamos tanto el servicio como el gateway para que otros módulos puedan usarlos.
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}