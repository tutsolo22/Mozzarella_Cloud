import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting } from './entities/setting.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SmtpController } from './smtp.controller';
import { SmtpService } from './smtp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [SettingsController, SmtpController],
  providers: [SettingsService, RolesGuard, SmtpService],
  exports: [SettingsService],
})
export class SettingsModule {}