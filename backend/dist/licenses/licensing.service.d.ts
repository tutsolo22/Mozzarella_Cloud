import { JwtService } from '@nestjs/jwt';
import { Repository, QueryRunner } from 'typeorm';
import { License } from './entities/license.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
export interface LicensePayload {
    tenantId: string;
    userLimit: number;
    branchLimit: number;
    exp: number;
}
export declare class LicensingService {
    private readonly licenseRepository;
    private readonly jwtService;
    constructor(licenseRepository: Repository<License>, jwtService: JwtService);
    generateLicense(tenant: Tenant, userLimit: number, branchLimit: number, expiresAt: Date, queryRunner?: QueryRunner): Promise<License>;
    revokeLicense(tenantId: string): Promise<License>;
}
