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
const mailer_1 = require("@nestjs-modules/mailer");
const crypto = require("crypto");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(usersRepository, dataSource, jwtService, mailerService, configService) {
        this.usersRepository = usersRepository;
        this.dataSource = dataSource;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.configService = configService;
    }
    async validateUser(email, pass) {
        const user = await this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.tenant', 'tenant')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
        if (!user) {
            return null;
        }
        if (user.status !== user_entity_1.UserStatus.Active) {
            throw new common_1.UnauthorizedException('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
        }
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const permissions = user.role.permissions?.map((p) => p.name) || [];
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
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role.name,
                permissions: permissions,
            }
        };
    }
    async sendVerificationEmail(user, token) {
        const verificationLink = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
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
    async register(registerDto) {
        const { tenantName, fullName, email, password } = registerDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingUser = await queryRunner.manager.findOne(user_entity_1.User, { where: { email } });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está registrado.');
            }
            const adminRole = await queryRunner.manager.findOne(role_entity_1.Role, { where: { name: 'admin' } });
            if (!adminRole) {
                throw new common_1.InternalServerErrorException('El rol de administrador base no está configurado.');
            }
            const tenant = queryRunner.manager.create(tenant_entity_1.Tenant, { name: tenantName });
            await queryRunner.manager.save(tenant);
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = queryRunner.manager.create(user_entity_1.User, {
                fullName,
                email,
                password: hashedPassword,
                role: adminRole,
                tenant: tenant,
                verificationToken,
                status: user_entity_1.UserStatus.PendingVerification,
            });
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            await this.sendVerificationEmail(user, verificationToken);
            return { message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            if (err instanceof common_1.ConflictException)
                throw err;
            throw new common_1.InternalServerErrorException('No se pudo completar el registro.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async verifyEmail(token) {
        const user = await this.usersRepository.findOne({ where: { verificationToken: token } });
        if (!user) {
            throw new common_1.NotFoundException('Token de verificación no válido o ya utilizado.');
        }
        user.status = user_entity_1.UserStatus.Active;
        user.verificationToken = null;
        await this.usersRepository.save(user);
        return user;
    }
    async requestPasswordReset(email) {
        const user = await this.usersRepository.findOneBy({ email });
        if (!user) {
            return;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 3600000);
        await this.usersRepository.save(user);
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
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
    async resetPassword(token, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.usersRepository.findOne({
            where: {
                passwordResetToken: hashedToken,
            },
        });
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new common_1.UnauthorizedException('El token es inválido o ha expirado.');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await this.usersRepository.save(user);
        delete user.password;
        return user;
    }
    async switchLocation(userId, locationId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions', 'tenant', 'tenant.locations'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        const canAccessLocation = user.tenant.locations.some(loc => loc.id === locationId);
        if (!canAccessLocation) {
            throw new common_1.ForbiddenException('No tienes permiso para acceder a esta sucursal.');
        }
        const permissions = user.role.permissions?.map((p) => p.name) || [];
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role.name,
            tenantId: user.tenantId,
            locationId: locationId,
            permissions: permissions,
        };
        return { access_token: this.jwtService.sign(payload) };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        jwt_1.JwtService,
        mailer_1.MailerService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map