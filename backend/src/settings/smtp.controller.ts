import { Controller, Get, Put, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { SmtpSettingsDto } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';

@Controller('settings/smtp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SuperAdmin)
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Get()
  getSmtpSettings(): Promise<SmtpSettingsDto> {
    return this.smtpService.getSmtpSettings();
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async saveSmtpSettings(@Body() smtpSettings: SmtpSettingsDto): Promise<void> {
    await this.smtpService.saveSmtpSettings(smtpSettings);
  }

  @Post('test-connection')
  testSmtpConnection(@Body() smtpSettings: SmtpSettingsDto): Promise<{ success: boolean; message: string }> {
    return this.smtpService.testSmtpConnection(smtpSettings);
  }

  @Post('send-form-test-email')
  sendTestEmailWithUnsavedSettings(@Body() testSmtpDto: TestSmtpDto): Promise<{ success: boolean; message: string }> {
    return this.smtpService.sendTestEmailWithUnsavedSettings(testSmtpDto);
  }

  @Post('send-test-email')
  sendConfiguredTestEmail(@Body('email') email: string): Promise<{ success: boolean; message: string }> {
    return this.smtpService.sendConfiguredTestEmail(email);
  }
}