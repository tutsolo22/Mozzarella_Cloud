import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { UserStatus } from './users/entities/user.entity';
import { RoleEnum } from './roles/enums/role.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  // Creamos una instancia de la aplicación pero sin levantarla como servidor
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);

  if (!dataSource.isInitialized) {
    console.error('❌ Error: No se pudo inicializar la conexión con la base de datos. Verifica tus variables de entorno en el archivo .env');
    await app.close();
    process.exit(1);
  }
  console.log('✅ Conexión con la base de datos establecida correctamente.');

  const configService = app.get(ConfigService);

  console.log('🌱 Iniciando el proceso de seeding...');
  console.log('⏳ Forzando la sincronización del esquema (creando tablas si no existen)...');
  await dataSource.synchronize();
  console.log('✅ Esquema sincronizado.');

  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  // --- 1. Asegurar que todos los roles base existan ---
  console.log('Verificando y creando roles base...');
  for (const roleName of Object.values(RoleEnum)) {
    let role = await roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      console.log(`Creando el rol: ${roleName}`);
      role = roleRepository.create({ name: roleName });
      await roleRepository.save(role);
    }
  }

  // Obtener la referencia al rol de Super Admin que ya sabemos que existe
  const superAdminRole = await roleRepository.findOne({ where: { name: RoleEnum.SuperAdmin } });

  // --- 2. Crear el usuario Super Admin ---
  const superAdminEmail = configService.get<string>('SUPER_ADMIN_EMAIL');
  const superAdminPassword = configService.get<string>('SUPER_ADMIN_PASSWORD');

  const existingSuperAdmin = await userRepository.findOne({
    where: { email: superAdminEmail },
  });

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
      status: UserStatus.Active, // ¡Importante! Activar el usuario.
      // El Super Admin no pertenece a ningún tenant
    });

    await userRepository.save(superAdminUser);
    console.log(`✅ Usuario Super Admin creado con éxito con el estado: ${superAdminUser.status}.`);
  }

  await app.close();
  console.log('🌱 Proceso de seeding finalizado.');
}

bootstrap();