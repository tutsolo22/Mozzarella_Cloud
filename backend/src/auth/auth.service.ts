import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    
    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
    }

    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role.name, 
      tenantId: user.tenantId 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
      }
    };
  }

  private async sendVerificationEmail(user: User, token: string) {
    const verificationLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/verify-email?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: '¡Bienvenido a Mozzarella Cloud! Confirma tu correo electrónico',
      html: `
        <h1>¡Gracias por registrarte!</h1>
        <p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });
  }

  async register(registerDto: RegisterDto) {
    const { tenantName, fullName, email, password } = registerDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, { where: { email } });
      if (existingUser) {
        throw new ConflictException('El email ya está registrado.');
      }

      const adminRole = await queryRunner.manager.findOne(Role, { where: { name: 'admin' } });
      if (!adminRole) {
        throw new InternalServerErrorException('El rol de administrador base no está configurado.');
      }

      const tenant = queryRunner.manager.create(Tenant, { name: tenantName });
      await queryRunner.manager.save(tenant);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = queryRunner.manager.create(User, { 
        fullName, 
        email, 
        password: hashedPassword, 
        role: adminRole, 
        tenant: tenant,
        verificationToken,
        status: UserStatus.PendingVerification,
      });
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      
      await this.sendVerificationEmail(user, verificationToken);

      return { message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('No se pudo completar el registro.');
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { verificationToken: token } });

    if (!user) {
      throw new NotFoundException('Token de verificación no válido o ya utilizado.');
    }

    user.status = UserStatus.Active;
    user.verificationToken = null;
    await this.usersRepository.save(user);

    return user;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      // No revelamos si el usuario existe o no por seguridad, pero no hacemos nada.
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // El token expira en 1 hora
    user.passwordResetExpires = new Date(Date.now() + 3600000);

    await this.usersRepository.save(user);

    const resetUrl = `${this.configService.get(
      'FRONTEND_URL',
    )}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Solicitud de reseteo de contraseña',
      html: `
        <h1>Has solicitado un reseteo de contraseña</h1>
        <p>Haz clic en este <a href="${resetUrl}">enlace</a> para establecer una nueva contraseña.</p>
        <p>Si no has sido tú, ignora este correo.</p>
      `,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('El token es inválido o ha expirado.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await this.usersRepository.save(user);

    // Omitir datos sensibles antes de devolver
    delete user.password;
    return user;
  }
}