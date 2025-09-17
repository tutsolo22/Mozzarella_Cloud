import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

// Helper to ask for input from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function bootstrap() {
  console.log('⚡ Iniciando script para resetear contraseña del Super Admin...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const userRepository = app.get(getRepositoryToken(User));

    const superAdminEmail = configService.get<string>('SUPER_ADMIN_EMAIL');
    if (!superAdminEmail) {
      throw new Error('SUPER_ADMIN_EMAIL no está definido en tu archivo .env');
    }

    const user = await userRepository.findOneBy({ email: superAdminEmail });

    if (!user) {
      throw new Error(`No se encontró al super admin con el email: ${superAdminEmail}`);
    }

    console.log(`🔑 Se encontró al Super Admin: ${user.fullName} (${user.email})`);

    const newPassword = await askQuestion('Introduce la nueva contraseña para el Super Admin: ');
    if (newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.status = UserStatus.Active; // Aseguramos que el usuario esté activo

    await userRepository.save(user);

    console.log('✅ ¡Contraseña del Super Admin actualizada con éxito!');
  } catch (error) {
    console.error('🔥 Ocurrió un error durante el proceso:', error.message);
  } finally {
    rl.close();
    await app.close();
    process.exit(0);
  }
}

bootstrap();