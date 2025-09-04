import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private usersRepository;
    private dataSource;
    private jwtService;
    private mailerService;
    private readonly configService;
    constructor(usersRepository: Repository<User>, dataSource: DataSource, jwtService: JwtService, mailerService: MailerService, configService: ConfigService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: User): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            permissions: string[];
        };
    }>;
    private sendVerificationEmail;
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<User>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<User>;
    switchLocation(userId: string, locationId: string): Promise<{
        access_token: string;
    }>;
}
