import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// Cargar .env y permitir que sobreescriba las variables de entorno existentes.
// Esto es crucial para entornos como GitHub Codespaces que pre-configuran variables de BD.
import { config } from 'dotenv';
import { join } from 'path';
// Carga el .env desde la raíz del proyecto para unificar la configuración.
config({ path: join(__dirname, '..', '..', '.env'), override: true });

import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

async function bootstrap() {
  const bootstrapLogger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: false, // Desactiva el logger por defecto de NestJS para usar Winston
    });
    bootstrapLogger.log('Instancia de la aplicación NestJS creada correctamente.');

    // Habilitar CORS para permitir peticiones desde el frontend
    app.enableCors({
      origin: true, // En producción, deberías restringir esto a la URL de tu frontend
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    bootstrapLogger.log('CORS habilitado.');

    // Configuración de Winston para logging en archivos con rotación diaria
    const transport = new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    });

    // Reemplazar el logger por defecto de NestJS con nuestra instancia de Winston
    const winstonLogger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        transport,
      ],
    });
    app.useLogger(winstonLogger);
    bootstrapLogger.log('Logger de Winston configurado y adjuntado.');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    bootstrapLogger.log('ValidationPipe global configurado.');

    // Servir archivos estáticos desde la carpeta 'public'
    app.useStaticAssets(join(__dirname, '..', 'public'));
    bootstrapLogger.log('Archivos estáticos configurados.');

    const port = parseInt(process.env.PORT || '3000', 10);
    bootstrapLogger.log(`Intentando iniciar el servidor en el puerto ${port}...`);

    await app.listen(port);

    winstonLogger.info(`🚀 La aplicación está corriendo en: http://localhost:${port}`);
  } catch (error) {
    bootstrapLogger.error('****** ERROR CRÍTICO DURANTE EL BOOTSTRAP ******');
    bootstrapLogger.error(error);
    if (error.stack) {
      bootstrapLogger.error(error.stack);
    }
    process.exit(1);
  }
}
bootstrap();