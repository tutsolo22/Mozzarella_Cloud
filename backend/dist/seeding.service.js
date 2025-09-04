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
var SeedingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./users/entities/user.entity");
const role_entity_1 = require("./roles/entities/role.entity");
const role_enum_1 = require("./roles/enums/role.enum");
let SeedingService = SeedingService_1 = class SeedingService {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.logger = new common_1.Logger(SeedingService_1.name);
    }
    async seed() {
        this.logger.log('Iniciando el sembrado (seeding) de la base de datos...');
        await this.seedRoles();
        await this.seedSuperAdmin();
        this.logger.log('Sembrado de la base de datos finalizado.');
    }
    async seedRoles() {
        const rolesToSeed = Object.values(role_enum_1.RoleEnum).map((roleName) => ({
            name: roleName,
        }));
        for (const roleData of rolesToSeed) {
            const roleExists = await this.roleRepository.findOneBy({ name: roleData.name });
            if (!roleExists) {
                const newRole = this.roleRepository.create(roleData);
                await this.roleRepository.save(newRole);
                this.logger.log(`Rol "${roleData.name}" creado.`);
            }
        }
    }
    async seedSuperAdmin() {
        const superAdminEmail = 'tutsolo22@gmail.com';
        const userExists = await this.userRepository.findOneBy({ email: superAdminEmail });
        if (userExists) {
            this.logger.log('El usuario SuperAdmin ya existe. Omitiendo.');
            return;
        }
        const superAdminRole = await this.roleRepository.findOneBy({ name: role_enum_1.RoleEnum.SuperAdmin });
        if (!superAdminRole) {
            this.logger.error('Rol SuperAdmin no encontrado. No se puede crear el usuario SuperAdmin.');
            return;
        }
        const hashedPassword = await bcrypt.hash('Passsword', 10);
        const superAdmin = this.userRepository.create({
            email: superAdminEmail,
            password: hashedPassword,
            fullName: 'Super Admin',
            role: superAdminRole,
        });
        await this.userRepository.save(superAdmin);
        this.logger.log(`Usuario SuperAdmin "${superAdminEmail}" creado exitosamente.`);
    }
};
exports.SeedingService = SeedingService;
exports.SeedingService = SeedingService = SeedingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeedingService);
//# sourceMappingURL=seeding.service.js.map