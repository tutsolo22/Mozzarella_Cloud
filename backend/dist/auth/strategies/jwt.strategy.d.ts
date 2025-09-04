import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from '../decorators/user.decorator';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
        tenantId: string;
    }): Promise<UserPayload>;
}
export {};
