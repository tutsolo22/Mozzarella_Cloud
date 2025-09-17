import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RoleEnum } from '../roles/enums/role.enum';
import { UserPayload } from './decorators/user.decorator';
import { SwitchLocationDto } from './dto/switch-location.dto';
import { SetupAccountDto } from './dto/setup-account.dto';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(req: any, _loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            status: import("../users/entities/user.entity").UserStatus;
            fullName: string;
            role: {
                id: string;
                name: RoleEnum;
            };
            permissions: string[];
            locationId: string;
            tenant: {
                id: string;
                name: string;
            };
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    requestPasswordReset(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    setupAccount(setupAccountDto: SetupAccountDto): Promise<any>;
    getProfile(user: UserPayload): Promise<{
        id: string;
        email: string;
        fullName: string;
        status: import("../users/entities/user.entity").UserStatus;
        role: {
            id: string;
            name: RoleEnum;
        };
        locationId: string;
        permissions: string[];
        tenant: {
            id: string;
            name: string;
        };
    }>;
    switchLocation(user: UserPayload, switchLocationDto: SwitchLocationDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            status: import("../users/entities/user.entity").UserStatus;
            fullName: string;
            role: {
                id: string;
                name: RoleEnum;
            };
            tenant: {
                id: string;
                name: string;
            };
            locationId: string;
            location: import("../locations/entities/location.entity").Location;
            permissions: string[];
        };
    }>;
}
