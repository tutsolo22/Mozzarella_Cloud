import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true, // En producción, deberías restringir esto a la URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir archivos estáticos desde la carpeta 'public'
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Ejecutar el seeder solo en entorno de desarrollo.
  // Asegúrate de que NODE_ENV esté configurado como 'development' en tus scripts de npm.
  // Por ejemplo: "start:dev": "cross-env NODE_ENV=development nest start --watch"
  if (process.env.NODE_ENV === 'development') {
    const seeder = app.get(SeedingService);
    await seeder.seed();
  }

  await app.listen(3000);
}
bootstrap();