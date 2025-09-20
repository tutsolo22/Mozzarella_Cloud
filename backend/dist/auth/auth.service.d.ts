import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Location } from '../locations/entities/location.entity';
import { RoleEnum } from '../roles/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { SetupAccountDto } from './dto/setup-account.dto';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { LicensingService } from '../licenses/licensing.service';
export declare class AuthService {
    private usersRepository;
    private dataSource;
    private jwtService;
    private readonly configService;
    private readonly settingsService;
    private readonly licensingService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, dataSource: DataSource, jwtService: JwtService, configService: ConfigService, settingsService: SettingsService, licensingService: LicensingService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: User): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            status: UserStatus;
            fullName: string;
            role: {
                id: string;
                name: RoleEnum;
            };
            permissions: string[];
            locationId: string;
            location: Location;
            tenant: {
                id: string;
                name: string;
            };
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        status: UserStatus;
        role: {
            id: string;
            name: RoleEnum;
        };
        locationId: string;
        location: Location;
        permissions: string[];
        tenant: {
            id: string;
            name: string;
        };
    }>;
    private getFrontendUrl;
    private createTransporter;
    private sendVerificationEmail;
    private sendInactiveAccountPasswordResetAttemptEmail;
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<User>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<User>;
    switchLocation(userId: string, locationId: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            status: UserStatus;
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
            location: Location;
            permissions: string[];
        };
    }>;
    sendAccountSetupEmail(user: User): Promise<void>;
    setupAccount(setupAccountDto: SetupAccountDto): Promise<any>;
    resendInvitation(userId: string): Promise<{
        message: string;
    }>;
}
