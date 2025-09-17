import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../users/entities/user.entity';
import { Tenant, TenantPlan } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { Location } from '../locations/entities/location.entity';
import { RoleEnum } from '../roles/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { SetupAccountDto } from './dto/setup-account.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    // 1. Validar que el usuario exista y la contraseña sea correcta.
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Las credenciales son incorrectas.');
    }

    // 2. Validar que la cuenta esté activa.
    if (user.status !== UserStatus.Active) {
      if (user.status === UserStatus.PendingVerification) {
        throw new UnauthorizedException('Tu cuenta está pendiente de activación. Por favor, revisa el correo de bienvenida.');
      }
      if (user.status === UserStatus.Suspended) {
        throw new UnauthorizedException('Tu cuenta ha sido suspendida. Contacta a soporte.');
      }
      throw new UnauthorizedException('Tu cuenta no se encuentra activa.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(user: User) {
    // Aplanamos los permisos del rol en un array de strings.
    // El '?' es por si un rol no tuviera permisos asignados.
    let permissions = user.role.permissions?.map((p) => p.name) || [];

    // Si el tenant tiene un plan Básico, filtramos los permisos avanzados.
    if (user.tenant && user.tenant.plan === TenantPlan.Basic) {
      const advancedPermissions = new Set([
        'manage:dispatch', // Módulo de Reparto Avanzado
        'manage:financials', // Módulo Financiero
        'view:consolidated_reports', // Reportes Consolidados
        'manage:hr', // Módulo de RRHH
        // Aquí puedes añadir otros permisos considerados "avanzados"
      ]);

      permissions = permissions.filter(p => !advancedPermissions.has(p));
    }


    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role.name, 
      tenantId: user.tenantId,
      locationId: user.locationId,
      permissions: permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      // We build a user object that is safe to send to the frontend.
      // It should match the User type on the frontend.
      user: { // This is a DTO, not the User entity.
        id: user.id,
        email: user.email,
        status: user.status,
        fullName: user.fullName,
        role: { id: user.role.id, name: user.role.name },
        permissions: permissions,
        locationId: user.locationId,
        // location is not loaded here, so it will be undefined, which is fine.
        tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : undefined,
      }
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'tenant', 'role.permissions'],
    });

    if (!user) {
      // This case is unlikely if the token is valid, but it's a good safeguard.
      throw new NotFoundException('Usuario no encontrado.');
    }

    const permissions = user.role?.permissions?.map((p) => p.name) || [];

    // Return a safe user object, similar to the one in the login response.
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      role: { id: user.role.id, name: user.role.name },
      locationId: user.locationId,
      permissions: permissions,
      tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : undefined,
    };
  }

  private getFrontendUrl(): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      this.logger.error(
        'La variable de entorno FRONTEND_URL no está configurada. No se pueden generar los enlaces de correo.',
      );
      throw new InternalServerErrorException(
        'La URL del frontend no está configurada en el servidor.',
      );
    }
    return frontendUrl;
  }

  private async createTransporter() {
    try {
      const { transport, from } = await this.settingsService.getSmtpTransportOptions();
      const transporter = createTransport(transport);
      return { transporter, from };
    } catch (error) {
      this.logger.error('Error al crear el transportador de correo desde la configuración de la BD.', error.stack);
      // Lanza el error para que la función que lo llama sepa que no se pudo enviar el correo.
      throw new InternalServerErrorException('No se pudo configurar el servicio de correo. Revisa la configuración SMTP.');
    }
  }

  private async sendVerificationEmail(user: User, token: string) {
    const verificationLink = `${this.getFrontendUrl()}/verify-email?token=${token}`;

    try {
      const { transporter, from } = await this.createTransporter();
      await transporter.sendMail({
        from,
        to: user.email,
        subject: '¡Bienvenido a Mozzarella Cloud! Confirma tu correo electrónico',
        html: `
        <h1>¡Gracias por registrarte!</h1>
        <p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
      });
    } catch (error) {
      this.logger.error(`Fallo al enviar correo de verificación a ${user.email}`, error.stack);
      // No relanzamos el error para no interrumpir el flujo de registro, pero lo registramos.
    }
  }

  private async sendInactiveAccountPasswordResetAttemptEmail(user: User) {
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    if (!superAdminEmail) {
      this.logger.error('SUPER_ADMIN_EMAIL no está configurado. No se puede enviar el correo de cuenta inactiva.');
      return; // No lanzar error al cliente para no filtrar información.
    }

    try {
      const { transporter, from } = await this.createTransporter();
      await transporter.sendMail({
        from,
        to: user.email,
        subject: 'Acción requerida para tu cuenta de Mozzarella Cloud',
        html: `
          <h1>Hola ${user.fullName},</h1>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Mozzarella Cloud.</p>
          <p>Hemos notado que tu cuenta aún no ha sido activada. Para poder acceder, primero es necesario que completes el proceso de activación.</p>
          <p>Por favor, contacta al administrador que te dio de alta o escribe a <strong>${superAdminEmail}</strong> para solicitar que te reenvíen el correo de activación.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        `,
      });
      this.logger.log(`Correo informativo de cuenta inactiva enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(`Fallo al enviar correo de cuenta inactiva a ${user.email}`, error.stack);
    }
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

      const adminRole = await queryRunner.manager.findOne(Role, { where: { name: RoleEnum.Admin } });
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
      this.logger.warn(`Intento de reseteo de contraseña para email no registrado: ${email}`);
      return;
    }

    if (user.status !== UserStatus.Active) {
      this.logger.warn(`Intento de reseteo de contraseña para cuenta no activa (estado: ${user.status}): ${email}`);
      await this.sendInactiveAccountPasswordResetAttemptEmail(user);
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

    const resetUrl = `${this.getFrontendUrl()}/reset-password?token=${resetToken}`;

    try {
      const { transporter, from } = await this.createTransporter();
      await transporter.sendMail({
        from,
        to: user.email,
        subject: 'Solicitud de reseteo de contraseña',
        html: `
          <h1>Has solicitado un reseteo de contraseña</h1>
          <p>Haz clic en este <a href="${resetUrl}">enlace</a> para establecer una nueva contraseña.</p>
          <p>Si no has sido tú, ignora este correo.</p>
        `,
      });
      this.logger.log(`Correo de reseteo de contraseña enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo de reseteo a ${user.email}`, error.stack);
      // Es importante notificar al frontend que algo salió mal.
      throw new InternalServerErrorException('No se pudo enviar el correo de reseteo. Por favor, inténtalo de nuevo más tarde.');
    }
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

  async switchLocation(userId: string, locationId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions', 'tenant'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!user.tenantId) {
      throw new ForbiddenException('El usuario no pertenece a ningún tenant.');
    }

    // Security check: ensure the requested location belongs to the user's tenant.
    const location = await this.dataSource.getRepository(Location).findOneBy({ id: locationId, tenantId: user.tenantId });
    if (!location) {
      throw new ForbiddenException('No tienes permiso para acceder a esta sucursal.');
    }

    // The user object is valid and has access. Now, generate a new token
    // with the updated locationId in the payload.
    const permissions = user.role.permissions?.map((p) => p.name) || [];
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.name,
      tenantId: user.tenantId,
      locationId: locationId, // The new locationId
      permissions: permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    // We build a user object that is safe to send to the frontend.
    const userForFrontend = {
      id: user.id,
      email: user.email,
      status: user.status,
      fullName: user.fullName,
      role: { id: user.role.id, name: user.role.name },
      tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : undefined,
      locationId: locationId,
      location: location,
      permissions: permissions,
    };

    return {
      access_token: accessToken,
      user: userForFrontend,
    };
  }

  async sendAccountSetupEmail(user: User): Promise<void> {
    const setupToken = crypto.randomBytes(32).toString('hex');

    user.accountSetupToken = crypto
      .createHash('sha256')
      .update(setupToken)
      .digest('hex');

    // Token expires in 24 hours
    user.accountSetupTokenExpires = new Date(Date.now() + 24 * 3600 * 1000);

    await this.usersRepository.save(user);

    const setupUrl = `${this.getFrontendUrl()}/setup-account?token=${setupToken}`;

    try {
      const { transporter, from } = await this.createTransporter();
      await transporter.sendMail({
        from,
        to: user.email,
        subject: 'Completa la configuración de tu cuenta en Mozzarella Cloud',
        html: `
          <h1>¡Bienvenido a Mozzarella Cloud!</h1>
          <p>Hola ${user.fullName}, has sido invitado a unirte a Mozzarella Cloud. Para completar la configuración de tu cuenta y establecer tu contraseña, por favor haz clic en el siguiente enlace:</p>
          <p><a href="${setupUrl}">${setupUrl}</a></p>
          <p>Este enlace es válido por 24 horas.</p>
          <p>Si no puedes hacer clic en el enlace, cópialo y pégalo en tu navegador.</p>
          <p>Si no esperabas este correo, puedes ignorarlo de forma segura.</p>
          <br>
          <a href="${setupUrl}" style="background-color: #DAA520; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: sans-serif; font-weight: bold;">Configurar mi cuenta</a>
        `,
      });
      this.logger.log(`Correo de configuración de cuenta enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Fallo al enviar el correo de configuración de cuenta a ${user.email}.`,
        error.stack,
      );
      // Relanzamos el error para que la función que lo llama (p. ej., resendInvitation)
      // sepa que el envío falló y pueda informar al usuario.
      // El flujo de creación de tenant debe encargarse de capturar este error si no quiere interrumpirse.
      throw new InternalServerErrorException(`Fallo al enviar el correo de invitación. Verifique la configuración de correo (SMTP) y que la URL del frontend esté configurada.`);
    }
  }

  async setupAccount(setupAccountDto: SetupAccountDto): Promise<any> {
    const { token, password } = setupAccountDto;

    if (!token || !password) {
      throw new BadRequestException('El token y la contraseña son requeridos.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await queryRunner.manager.findOne(User, {
        where: {
          accountSetupToken: hashedToken,
        },
        relations: ['role', 'role.permissions', 'tenant'],
      });

      if (!user || !user.accountSetupTokenExpires || user.accountSetupTokenExpires < new Date()) {
        throw new UnauthorizedException('El token es inválido o ha expirado.');
      }

      if (user.status !== UserStatus.PendingVerification) {
        throw new BadRequestException('Esta cuenta ya ha sido activada. Por favor, inicia sesión.');
      }

      user.password = await bcrypt.hash(password, 10);
      user.status = UserStatus.Active;
      user.accountSetupToken = null;
      user.accountSetupTokenExpires = null;

      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      return this.login(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error en setupAccount', error.stack);
      throw new InternalServerErrorException('Ocurrió un error al configurar la cuenta.');
    } finally {
      await queryRunner.release();
    }
  }

  async resendInvitation(userId: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (user.status !== UserStatus.PendingVerification) {
      throw new BadRequestException('La cuenta de este usuario ya ha sido activada.');
    }

    await this.sendAccountSetupEmail(user);

    return { message: 'Invitación reenviada con éxito.' };
  }
}