import { LicenseValidationService } from './license-validation.service';
import { ValidateLicenseDto } from './dto/validate-license.dto';
export declare class LicenseValidationController {
    private readonly licenseValidationService;
    constructor(licenseValidationService: LicenseValidationService);
    validateLicense(validateLicenseDto: ValidateLicenseDto): Promise<any>;
}
