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
import { Tenant, TenantPlan, TenantStatus } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { Location } from '../locations/entities/location.entity';
import { RoleEnum } from '../roles/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { SetupAccountDto } from './dto/setup-account.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SettingsService } from '../settings/settings.service';
import { LicensingService } from '../licenses/licensing.service';

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
    private readonly licensingService: LicensingService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect('user.location', 'location')
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
    // Se centraliza la validación aquí para asegurar que cualquier flujo (login, setup, etc.)
    // que llame a `login` trabaje con un objeto de usuario completo.

    if (!user.role) {
      this.logger.error(`¡ERROR CRÍTICO! El usuario ${user.id} (${user.email}) fue pasado a la función login sin rol. El dashboard fallará.`);
      throw new InternalServerErrorException('Error de consistencia: no se pudo cargar el rol del usuario.');
    }

    // Log de verificación para depuración definitiva.
    this.logger.log(
      `[LOGIN-VALIDATION-V4] User ${user.id} has role: ${user.role.name} and permissions count: ${user.role.permissions?.length || 0}`,
    );

    // El SuperAdmin no tiene sucursal, así que omitimos esta validación para él.
    if (user.role.name !== RoleEnum.SuperAdmin && !user.location) {
      this.logger.error(`¡ERROR CRÍTICO! El usuario ${user.id} (${user.email}) que no es SuperAdmin fue pasado a la función login sin sucursal (location). El dashboard se mostrará en blanco.`);
      throw new InternalServerErrorException('Error de consistencia: no se pudo cargar la sucursal del usuario.');
    }

    // user.role.permissions puede ser undefined si la relación no se cargó, o un array vacío si no hay permisos.
    // En ambos casos, el resultado debe ser un array vacío.
    let permissions =
      user.role.permissions?.map((p) => `${p.action}:${p.subject}`) || [];

    // Si el tenant tiene un plan Básico, filtramos los permisos avanzados.
    if (user.tenant && user.tenant.plan === TenantPlan.Basic) {
      const advancedPermissions = new Set([
        'manage:dispatch', // Módulo de Reparto Avanzado
        'manage:financials', // Módulo Financiero
        'view:consolidated_reports', // Reportes Consolidados
        'manage:hr', // Módulo de RRHH
      ]);

      permissions = permissions.filter(p => !advancedPermissions.has(p));
    }


    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role.name, 
      fullName: user.fullName,
      tenantId: user.tenantId,
      locationId: user.locationId,
      permissions: permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        fullName: user.fullName,
        role: { id: user.role.id, name: user.role.name },
        permissions: permissions,
        locationId: user.locationId,
        location: user.location,
        tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name } : undefined,
      }
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'tenant', 'role.permissions', 'location'],
    });

    if (!user) {
      // This case is unlikely if the token is valid, but it's a good safeguard.
      throw new NotFoundException('Usuario no encontrado.');
    }

    const permissions =
      user.role?.permissions?.map((p) => `${p.action}:${p.subject}`) || [];

    // Return a safe user object, similar to the one in the login response.
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      role: { id: user.role.id, name: user.role.name },
      locationId: user.locationId,
      location: user.location,
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
    // El enlace apunta a una página dedicada en el frontend.
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
      const existingUser = await queryRunner.manager.findOneBy(User, { email });
      if (existingUser) {
        throw new ConflictException('El email ya está registrado.');
      }

      const adminRole = await queryRunner.manager.findOneBy(Role, { name: RoleEnum.Admin });
      if (!adminRole) {
        throw new InternalServerErrorException('El rol de administrador base no está configurado.');
      }

      const tenant = queryRunner.manager.create(Tenant, {
        name: tenantName,
        status: TenantStatus.Inactive,
        plan: null,
      });
      await queryRunner.manager.save(tenant);

      const defaultLocation = queryRunner.manager.create(Location, {
        name: 'Sucursal Principal',
        address: 'Dirección por definir',
        tenantId: tenant.id,
        isActive: true,
      });
      await queryRunner.manager.save(defaultLocation);

      const hashedPassword = await bcrypt.hash(password, 10);
      // --- CORRECCIÓN ---
      // Se asignan los IDs directamente para asegurar la correcta creación de las relaciones.
      const user = queryRunner.manager.create(User, {
        fullName,
        email,
        password: hashedPassword,
        roleId: adminRole.id, // Asignación explícita del ID del rol
        tenantId: tenant.id, // Asignación explícita del ID del tenant
        locationId: defaultLocation.id,
        status: UserStatus.PendingVerification,
      });

      await queryRunner.manager.save(user);

      // Generar un token JWT para la verificación de correo
      const payload = { sub: user.id, type: 'email-verification' };
      const verificationToken = this.jwtService.sign(payload, { expiresIn: '24h' });

      await queryRunner.commitTransaction();
      
      await this.sendVerificationEmail(user, verificationToken);

      return { message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to register user: ${err.message}`, err.stack);
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('No se pudo completar el registro.');
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'email-verification' || !payload.sub) {
        throw new UnauthorizedException('El token es inválido o no es para esta acción.');
      }

      const userId = payload.sub;

      // Se cambia a QueryBuilder para asegurar que la relación con 'tenant' se cargue correctamente.
      // El método `findOne` con el array `relations` puede ser inconsistente en algunos casos.
      let user = await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new NotFoundException('Token de verificación no válido o ya utilizado.');
      }

      // Fallback: Si la relación tenant no se cargó correctamente por alguna razón, la cargamos explícitamente.
      if (!user.tenant && user.tenantId) {
        user.tenant = await this.dataSource.getRepository(Tenant).findOneBy({ id: user.tenantId });
        if (!user.tenant) {
          throw new InternalServerErrorException('Error de consistencia de datos: Tenant no encontrado.');
        }
      } else if (!user.tenant && !user.tenantId) {
        throw new InternalServerErrorException('Error de consistencia de datos: Usuario sin Tenant asignado.');
      }

      if (user.status === UserStatus.Active) {
        throw new BadRequestException('Esta cuenta ya ha sido verificada.');
      }

      user.status = UserStatus.Active;

      // Ahora que hemos asegurado que user.tenant está cargado, podemos verificar su estado.
      if (user.tenant.status === TenantStatus.Inactive) {
        user.tenant.status = TenantStatus.Trial;
        user.tenant.plan = TenantPlan.Trial;
        await this.dataSource.getRepository(Tenant).save(user.tenant);

        // Generar licencia de prueba al activar el tenant por registro público
        this.logger.log(`Tenant '${user.tenant.name}' activado por registro público. Generando licencia de prueba.`);
        const trialDurationDays = 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + trialDurationDays);
        await this.licensingService.generateLicense(user.tenant, 5, 1, expiresAt);
      }

      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('El token de verificación es inválido o ha expirado.');
      }
      this.logger.error('Error en verifyEmail', error.stack);
      throw new InternalServerErrorException('Ocurrió un error al verificar el correo.');
    }
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

    // Crear un JWT de corta duración para el reseteo de contraseña.
    const payload = { sub: user.id, type: 'password-reset' };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '1h' });

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
    if (!token || !newPassword) {
      throw new BadRequestException('El token y la nueva contraseña son requeridos.');
    }

    try {
      // 1. Verificar el token JWT
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'password-reset' || !payload.sub) {
        throw new UnauthorizedException('El token es inválido o no es para esta acción.');
      }
      const userId = payload.sub;

      // 2. Encontrar al usuario
      const user = await this.usersRepository.findOneBy({ id: userId });

      if (!user || user.status !== UserStatus.Active) {
        throw new UnauthorizedException('El token es inválido o la cuenta no está activa.');
      }

      // 3. Actualizar contraseña y guardar
      user.password = await bcrypt.hash(newPassword, 10);
      await this.usersRepository.save(user);

      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('El token es inválido o ha expirado.');
      }
      this.logger.error('Error en resetPassword', error.stack);
      throw new InternalServerErrorException('Ocurrió un error al restablecer la contraseña.');
    }
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
    const permissions =
      user.role.permissions?.map((p) => `${p.action}:${p.subject}`) || [];
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
    // 1. Crear un JWT de corta duración para la configuración de la cuenta.
    const payload = { sub: user.id, type: 'account-setup' };
    const setupToken = this.jwtService.sign(payload, { expiresIn: '24h' });

    const setupUrl = `${this.getFrontendUrl()}/setup-account?token=${setupToken}`;

    try {
      // 2. Preparar y enviar el correo. Si esto falla, no se ha hecho ningún cambio en la BD.
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

    try {
      // 1. Verificar el token JWT
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'account-setup' || !payload.sub) {
        throw new UnauthorizedException('El token es inválido o no es para esta acción.');
      }
      const userId = payload.sub;

      this.logger.log(`Iniciando setupAccount para userId: ${userId}. Cargando usuario con todas las relaciones...`);

      // 2. Encontrar al usuario
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['role', 'role.permissions', 'tenant', 'location'],
      });

      if (!user) {
        throw new UnauthorizedException('El token es inválido o ha expirado.');
      }

      // La única validación necesaria aquí es que el usuario exista.
      // Todas las demás comprobaciones de consistencia (rol, permisos, sucursal) se centralizan en la función `login`.

      if (user.status !== UserStatus.PendingVerification) {
        throw new BadRequestException('Esta cuenta ya ha sido activada. Por favor, inicia sesión.');
      }

      // 3. Actualizar usuario y guardar
      user.password = await bcrypt.hash(password, 10);
      user.status = UserStatus.Active;

      // FIX: If the tenant was inactive, this first activation moves it to Trial status.
      if (user.tenant && user.tenant.status === TenantStatus.Inactive) {
        user.tenant.status = TenantStatus.Trial;
        user.tenant.plan = TenantPlan.Trial;
        await this.dataSource.getRepository(Tenant).save(user.tenant);

        // Generar licencia de prueba al activar el tenant
        this.logger.log(`Tenant ${user.tenant.name} activado. Generando licencia de prueba.`);
        const trialDurationDays = 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + trialDurationDays);
        await this.licensingService.generateLicense(
          user.tenant,
          5, // Límite de usuarios para la prueba
          1, // Límite de sucursales para la prueba
          expiresAt,
        );
      }

      await this.usersRepository.save(user);

      // 4. Iniciar sesión
      return this.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('El token es inválido o ha expirado.');
      }
      this.logger.error('Error en setupAccount', error.stack);
      throw new InternalServerErrorException('Ocurrió un error al configurar la cuenta.');
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