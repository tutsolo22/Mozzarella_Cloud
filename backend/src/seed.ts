import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(__dirname, '..', '..', '.env'), override: true });

import PermissionSeeder from './database/seed/permissions.seeder';
import RoleSeeder from './database/seed/roles.seeder';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { UserStatus } from './users/entities/user.entity';
import { RoleEnum } from './roles/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { runSeeders } from 'typeorm-extension';

async function bootstrap() {
  // Crear una única instancia de la aplicación NestJS para todo el proceso.
  // Esto asegura que usamos la misma configuración de base de datos en todas partes.
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('✅ Contexto de la aplicación NestJS creado.');

  try {
    // --- 1. Ejecutar los seeders de Permisos y Roles ---
    const dataSource = app.get(DataSource);
    if (!dataSource.isInitialized) {
      throw new Error(
        'DataSource no está inicializado. Verifica la conexión a la BD en AppModule.',
      );
    }
    console.log('🌱 Ejecutando seeders de Permisos y Roles...');
    await runSeeders(dataSource, {
      seeds: [PermissionSeeder, RoleSeeder],
    });
    console.log('✅ Seeders de Permisos y Roles finalizados.');

    // --- 2. Crear el usuario Super Admin ---
    const configService = app.get(ConfigService);
    const userRepository = app.get(getRepositoryToken(User));
    const roleRepository = app.get(getRepositoryToken(Role));

    const superAdminRole = await roleRepository.findOne({ where: { name: RoleEnum.SuperAdmin } });
    if (!superAdminRole) {
      throw new Error('El rol SuperAdmin no fue encontrado. Asegúrate de que el RoleSeeder se ejecutó correctamente.');
    }

    const superAdminEmail = configService.get<string>('SUPER_ADMIN_EMAIL');
    const superAdminPassword = configService.get<string>('SUPER_ADMIN_PASSWORD');

    if (!superAdminEmail || !superAdminPassword) {
      throw new Error('SUPER_ADMIN_EMAIL y SUPER_ADMIN_PASSWORD deben estar definidos en tu archivo .env');
    }

    const existingSuperAdmin = await userRepository.findOne({ where: { email: superAdminEmail } });

    if (existingSuperAdmin) {
      console.log('✅ El usuario Super Admin ya existe. No se requiere ninguna acción.');
    } else {
      console.log('Creando el usuario Super Admin...');
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      const superAdminUser = userRepository.create({
        email: superAdminEmail,
        password: hashedPassword,
        fullName: 'Super Admin',
        role: superAdminRole,
        status: UserStatus.Active,
      });
      await userRepository.save(superAdminUser);
      console.log(`✅ Usuario Super Admin creado con éxito.`);
    }
  } catch (error) {
    console.error('🔥 Ocurrió un error durante el proceso de seeding:', error);
    process.exit(1); // Salir con un código de error
  } finally {
    await app.close();
    console.log('🌱 Proceso de seeding finalizado.');
  }
}

bootstrap();