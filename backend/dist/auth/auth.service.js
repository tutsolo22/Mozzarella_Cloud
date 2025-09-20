"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/entities/user.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const location_entity_1 = require("../locations/entities/location.entity");
const role_enum_1 = require("../roles/enums/role.enum");
const config_1 = require("@nestjs/config");
const nodemailer_1 = require("nodemailer");
const settings_service_1 = require("../settings/settings.service");
const licensing_service_1 = require("../licenses/licensing.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersRepository, dataSource, jwtService, configService, settingsService, licensingService) {
        this.usersRepository = usersRepository;
        this.dataSource = dataSource;
        this.jwtService = jwtService;
        this.configService = configService;
        this.settingsService = settingsService;
        this.licensingService = licensingService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(email, pass) {
        const user = await this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .leftJoinAndSelect('user.tenant', 'tenant')
            .leftJoinAndSelect('user.location', 'location')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new common_1.UnauthorizedException('Las credenciales son incorrectas.');
        }
        if (user.status !== user_entity_1.UserStatus.Active) {
            if (user.status === user_entity_1.UserStatus.PendingVerification) {
                throw new common_1.UnauthorizedException('Tu cuenta está pendiente de activación. Por favor, revisa el correo de bienvenida.');
            }
            if (user.status === user_entity_1.UserStatus.Suspended) {
                throw new common_1.UnauthorizedException('Tu cuenta ha sido suspendida. Contacta a soporte.');
            }
            throw new common_1.UnauthorizedException('Tu cuenta no se encuentra activa.');
        }
        const { password, ...result } = user;
        return result;
    }
    async login(user) {
        if (!user.role) {
            this.logger.error(`¡ERROR CRÍTICO! El usuario ${user.id} (${user.email}) fue pasado a la función login sin rol. El dashboard fallará.`);
            throw new common_1.InternalServerErrorException('Error de consistencia: no se pudo cargar el rol del usuario.');
        }
        this.logger.log(`[LOGIN-VALIDATION-V4] User ${user.id} has role: ${user.role.name} and permissions count: ${user.role.permissions?.length || 0}`);
        if (user.role.name !== role_enum_1.RoleEnum.SuperAdmin && !user.location) {
            this.logger.error(`¡ERROR CRÍTICO! El usuario ${user.id} (${user.email}) que no es SuperAdmin fue pasado a la función login sin sucursal (location). El dashboard se mostrará en blanco.`);
            throw new common_1.InternalServerErrorException('Error de consistencia: no se pudo cargar la sucursal del usuario.');
        }
        let permissions = user.role.permissions?.map((p) => `${p.action}:${p.subject}`) || [];
        if (user.tenant && user.tenant.plan === tenant_entity_1.TenantPlan.Basic) {
            const advancedPermissions = new Set([
                'manage:dispatch',
                'manage:financials',
                'view:consolidated_reports',
                'manage:hr',
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
    async getProfile(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role', 'tenant', 'role.permissions', 'location'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        const permissions = user.role?.permissions?.map((p) => `${p.action}:${p.subject}`) || [];
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
    getFrontendUrl() {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        if (!frontendUrl) {
            this.logger.error('La variable de entorno FRONTEND_URL no está configurada. No se pueden generar los enlaces de correo.');
            throw new common_1.InternalServerErrorException('La URL del frontend no está configurada en el servidor.');
        }
        return frontendUrl;
    }
    async createTransporter() {
        try {
            const { transport, from } = await this.settingsService.getSmtpTransportOptions();
            const transporter = (0, nodemailer_1.createTransport)(transport);
            return { transporter, from };
        }
        catch (error) {
            this.logger.error('Error al crear el transportador de correo desde la configuración de la BD.', error.stack);
            throw new common_1.InternalServerErrorException('No se pudo configurar el servicio de correo. Revisa la configuración SMTP.');
        }
    }
    async sendVerificationEmail(user, token) {
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
        }
        catch (error) {
            this.logger.error(`Fallo al enviar correo de verificación a ${user.email}`, error.stack);
        }
    }
    async sendInactiveAccountPasswordResetAttemptEmail(user) {
        const superAdminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
        if (!superAdminEmail) {
            this.logger.error('SUPER_ADMIN_EMAIL no está configurado. No se puede enviar el correo de cuenta inactiva.');
            return;
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
        }
        catch (error) {
            this.logger.error(`Fallo al enviar correo de cuenta inactiva a ${user.email}`, error.stack);
        }
    }
    async register(registerDto) {
        const { tenantName, fullName, email, password } = registerDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingUser = await queryRunner.manager.findOneBy(user_entity_1.User, { email });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está registrado.');
            }
            const adminRole = await queryRunner.manager.findOneBy(role_entity_1.Role, { name: role_enum_1.RoleEnum.Admin });
            if (!adminRole) {
                throw new common_1.InternalServerErrorException('El rol de administrador base no está configurado.');
            }
            const tenant = queryRunner.manager.create(tenant_entity_1.Tenant, {
                name: tenantName,
                status: tenant_entity_1.TenantStatus.Inactive,
                plan: null,
            });
            await queryRunner.manager.save(tenant);
            const defaultLocation = queryRunner.manager.create(location_entity_1.Location, {
                name: 'Sucursal Principal',
                address: 'Dirección por definir',
                tenantId: tenant.id,
                isActive: true,
            });
            await queryRunner.manager.save(defaultLocation);
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = queryRunner.manager.create(user_entity_1.User, {
                fullName,
                email,
                password: hashedPassword,
                role: adminRole,
                tenant: tenant,
                locationId: defaultLocation.id,
                status: user_entity_1.UserStatus.PendingVerification,
            });
            await queryRunner.manager.save(user);
            const payload = { sub: user.id, type: 'email-verification' };
            const verificationToken = this.jwtService.sign(payload, { expiresIn: '24h' });
            await queryRunner.commitTransaction();
            await this.sendVerificationEmail(user, verificationToken);
            return { message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to register user: ${err.message}`, err.stack);
            if (err instanceof common_1.ConflictException)
                throw err;
            throw new common_1.InternalServerErrorException('No se pudo completar el registro.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async verifyEmail(token) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'email-verification' || !payload.sub) {
                throw new common_1.UnauthorizedException('El token es inválido o no es para esta acción.');
            }
            const userId = payload.sub;
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                relations: ['tenant', 'location'],
            });
            if (!user) {
                throw new common_1.NotFoundException('Token de verificación no válido o ya utilizado.');
            }
            if (user.status === user_entity_1.UserStatus.Active) {
                throw new common_1.BadRequestException('Esta cuenta ya ha sido verificada.');
            }
            user.status = user_entity_1.UserStatus.Active;
            if (user.tenant && user.tenant.status === tenant_entity_1.TenantStatus.Inactive) {
                user.tenant.status = tenant_entity_1.TenantStatus.Trial;
                user.tenant.plan = tenant_entity_1.TenantPlan.Trial;
                await this.dataSource.getRepository(tenant_entity_1.Tenant).save(user.tenant);
                this.logger.log(`Tenant ${user.tenant.name} activado por registro público. Generando licencia de prueba.`);
                const trialDurationDays = 30;
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + trialDurationDays);
                await this.licensingService.generateLicense(user.tenant, 5, 1, expiresAt);
            }
            await this.usersRepository.save(user);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('El token de verificación es inválido o ha expirado.');
            }
            this.logger.error('Error en verifyEmail', error.stack);
            throw new common_1.InternalServerErrorException('Ocurrió un error al verificar el correo.');
        }
    }
    async requestPasswordReset(email) {
        const user = await this.usersRepository.findOneBy({ email });
        if (!user) {
            this.logger.warn(`Intento de reseteo de contraseña para email no registrado: ${email}`);
            return;
        }
        if (user.status !== user_entity_1.UserStatus.Active) {
            this.logger.warn(`Intento de reseteo de contraseña para cuenta no activa (estado: ${user.status}): ${email}`);
            await this.sendInactiveAccountPasswordResetAttemptEmail(user);
            return;
        }
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
        }
        catch (error) {
            this.logger.error(`Error al enviar correo de reseteo a ${user.email}`, error.stack);
            throw new common_1.InternalServerErrorException('No se pudo enviar el correo de reseteo. Por favor, inténtalo de nuevo más tarde.');
        }
    }
    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new common_1.BadRequestException('El token y la nueva contraseña son requeridos.');
        }
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'password-reset' || !payload.sub) {
                throw new common_1.UnauthorizedException('El token es inválido o no es para esta acción.');
            }
            const userId = payload.sub;
            const user = await this.usersRepository.findOneBy({ id: userId });
            if (!user || user.status !== user_entity_1.UserStatus.Active) {
                throw new common_1.UnauthorizedException('El token es inválido o la cuenta no está activa.');
            }
            user.password = await bcrypt.hash(newPassword, 10);
            await this.usersRepository.save(user);
            delete user.password;
            return user;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('El token es inválido o ha expirado.');
            }
            this.logger.error('Error en resetPassword', error.stack);
            throw new common_1.InternalServerErrorException('Ocurrió un error al restablecer la contraseña.');
        }
    }
    async switchLocation(userId, locationId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions', 'tenant'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        if (!user.tenantId) {
            throw new common_1.ForbiddenException('El usuario no pertenece a ningún tenant.');
        }
        const location = await this.dataSource.getRepository(location_entity_1.Location).findOneBy({ id: locationId, tenantId: user.tenantId });
        if (!location) {
            throw new common_1.ForbiddenException('No tienes permiso para acceder a esta sucursal.');
        }
        const permissions = user.role.permissions?.map((p) => `${p.action}:${p.subject}`) || [];
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role.name,
            tenantId: user.tenantId,
            locationId: locationId,
            permissions: permissions,
        };
        const accessToken = this.jwtService.sign(payload);
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
    async sendAccountSetupEmail(user) {
        const payload = { sub: user.id, type: 'account-setup' };
        const setupToken = this.jwtService.sign(payload, { expiresIn: '24h' });
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
        }
        catch (error) {
            this.logger.error(`Fallo al enviar el correo de configuración de cuenta a ${user.email}.`, error.stack);
            throw new common_1.InternalServerErrorException(`Fallo al enviar el correo de invitación. Verifique la configuración de correo (SMTP) y que la URL del frontend esté configurada.`);
        }
    }
    async setupAccount(setupAccountDto) {
        const { token, password } = setupAccountDto;
        if (!token || !password) {
            throw new common_1.BadRequestException('El token y la contraseña son requeridos.');
        }
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'account-setup' || !payload.sub) {
                throw new common_1.UnauthorizedException('El token es inválido o no es para esta acción.');
            }
            const userId = payload.sub;
            this.logger.log(`Iniciando setupAccount para userId: ${userId}. Cargando usuario con todas las relaciones...`);
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                relations: ['role', 'role.permissions', 'tenant', 'location'],
            });
            if (!user) {
                throw new common_1.UnauthorizedException('El token es inválido o ha expirado.');
            }
            if (user.status !== user_entity_1.UserStatus.PendingVerification) {
                throw new common_1.BadRequestException('Esta cuenta ya ha sido activada. Por favor, inicia sesión.');
            }
            user.password = await bcrypt.hash(password, 10);
            user.status = user_entity_1.UserStatus.Active;
            if (user.tenant && user.tenant.status === tenant_entity_1.TenantStatus.Inactive) {
                user.tenant.status = tenant_entity_1.TenantStatus.Trial;
                user.tenant.plan = tenant_entity_1.TenantPlan.Trial;
                await this.dataSource.getRepository(tenant_entity_1.Tenant).save(user.tenant);
                this.logger.log(`Tenant ${user.tenant.name} activado. Generando licencia de prueba.`);
                const trialDurationDays = 30;
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + trialDurationDays);
                await this.licensingService.generateLicense(user.tenant, 5, 1, expiresAt);
            }
            await this.usersRepository.save(user);
            return this.login(user);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('El token es inválido o ha expirado.');
            }
            this.logger.error('Error en setupAccount', error.stack);
            throw new common_1.InternalServerErrorException('Ocurrió un error al configurar la cuenta.');
        }
    }
    async resendInvitation(userId) {
        const user = await this.usersRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        if (user.status !== user_entity_1.UserStatus.PendingVerification) {
            throw new common_1.BadRequestException('La cuenta de este usuario ya ha sido activada.');
        }
        await this.sendAccountSetupEmail(user);
        return { message: 'Invitación reenviada con éxito.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        jwt_1.JwtService,
        config_1.ConfigService,
        settings_service_1.SettingsService,
        licensing_service_1.LicensingService])
], AuthService);
//# sourceMappingURL=auth.service.js.map