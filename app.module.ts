// Módulo raíz de la aplicación NestJS.
// Aquí se importarán todos los demás módulos.
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule, UsersModule], // Aquí también debería estar la configuración de TypeOrmModule.forRoot(...)
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}