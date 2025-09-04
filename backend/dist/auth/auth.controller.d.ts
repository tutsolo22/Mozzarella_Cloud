import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserPayload } from './decorators/user.decorator';
import { SwitchLocationDto } from './dto/switch-location.dto';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(req: any, _loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            permissions: string[];
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    switchLocation(user: UserPayload, switchLocationDto: SwitchLocationDto): Promise<{
        access_token: string;
    }>;
}
