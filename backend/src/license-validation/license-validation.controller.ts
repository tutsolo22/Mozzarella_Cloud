import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LicenseValidationService } from './license-validation.service';
import { ValidateLicenseDto } from './dto/validate-license.dto';

@Controller('licenses')
export class LicenseValidationController {
  constructor(
    private readonly licenseValidationService: LicenseValidationService,
  ) {}

  /**
   * Endpoint público para que las instalaciones locales validen su clave de licencia.
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateLicense(@Body() validateLicenseDto: ValidateLicenseDto) {
    const { licenseKey, localTenantId } = validateLicenseDto;
    return this.licenseValidationService.validate(licenseKey, localTenantId);
  }
}