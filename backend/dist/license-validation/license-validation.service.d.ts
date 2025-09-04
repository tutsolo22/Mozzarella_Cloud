import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { License } from '../licenses/entities/license.entity';
export declare class LicenseValidationService {
    private readonly licenseRepository;
    private readonly jwtService;
    constructor(licenseRepository: Repository<License>, jwtService: JwtService);
    validate(licenseKey: string, localTenantId?: string): Promise<any>;
}
