import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiKeysService } from '../../api-keys/api-keys.service';
export declare class WebhookSignatureGuard implements CanActivate {
    private readonly apiKeysService;
    private readonly logger;
    constructor(apiKeysService: ApiKeysService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
