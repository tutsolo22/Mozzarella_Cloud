import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    ConfigModule, // Para acceder a las variables de entorno
  ],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}