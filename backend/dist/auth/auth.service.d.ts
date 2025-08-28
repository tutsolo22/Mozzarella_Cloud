import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
export declare class AuthService {
    private usersRepository;
    private dataSource;
    private jwtService;
    private mailerService;
    constructor(usersRepository: Repository<User>, dataSource: DataSource, jwtService: JwtService, mailerService: MailerService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: User): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
        };
    }>;
    private sendVerificationEmail;
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<User>;
}
