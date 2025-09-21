import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// Cargar .env y permitir que sobreescriba las variables de entorno existentes.
// Esto es crucial para entornos como GitHub Codespaces que pre-configuran variables de BD.
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}`, override: true });
config({ override: true }); // Fallback a .env

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false, // Desactiva el logger por defecto de NestJS
  });
  
  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true, // En producción, deberías restringir esto a la URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuración de Winston para logging en archivos con rotación diaria
  const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log', // Patrón del nombre de archivo
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Comprimir logs antiguos
    maxSize: '20m', // Tamaño máximo de 20MB por archivo
    maxFiles: '14d', // Mantener logs por 14 días
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(), // Formato JSON para fácil procesamiento
    ),
  });

  // Reemplazar el logger por defecto de NestJS con nuestra instancia de Winston
  app.useLogger(winston.createLogger({
    transports: [
      // Mantener el log en consola para desarrollo
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
      transport, // Añadir el transporte a archivos
    ],
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir archivos estáticos desde la carpeta 'public'
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(3000);
}
bootstrap();