import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TenantsService } from '../../tenants/tenants.service';
export declare class ApiKeyGuard implements CanActivate {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
