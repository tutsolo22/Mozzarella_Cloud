"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '..', '..', '.env'), override: true });
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const winston = require("winston");
require("winston-daily-rotate-file");
async function bootstrap() {
    const bootstrapLogger = new common_1.Logger('Bootstrap');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: false,
        });
        bootstrapLogger.log('Instancia de la aplicación NestJS creada correctamente.');
        app.enableCors({
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        bootstrapLogger.log('CORS habilitado.');
        const transport = new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        });
        const winstonLogger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.colorize(), winston.format.simple()),
                }),
                transport,
            ],
        });
        app.useLogger(winstonLogger);
        bootstrapLogger.log('Logger de Winston configurado y adjuntado.');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        bootstrapLogger.log('ValidationPipe global configurado.');
        app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
        bootstrapLogger.log('Archivos estáticos configurados.');
        const port = parseInt(process.env.PORT || '3000', 10);
        bootstrapLogger.log(`Intentando iniciar el servidor en el puerto ${port}...`);
        await app.listen(port);
        winstonLogger.info(`🚀 La aplicación está corriendo en: http://localhost:${port}`);
    }
    catch (error) {
        bootstrapLogger.error('****** ERROR CRÍTICO DURANTE EL BOOTSTRAP ******');
        bootstrapLogger.error(error);
        if (error.stack) {
            bootstrapLogger.error(error.stack);
        }
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map