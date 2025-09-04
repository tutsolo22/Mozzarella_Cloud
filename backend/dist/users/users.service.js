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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto, tenantId) {
        const { email, password, locationId, ...rest } = createUserDto;
        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está en uso.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            ...rest,
            email,
            password: hashedPassword,
            tenantId,
            locationId: locationId || null,
            status: user_entity_1.UserStatus.Active,
        });
        const savedUser = await this.userRepository.save(user);
        delete savedUser.password;
        return savedUser;
    }
    findAll(tenantId) {
        return this.userRepository.find({
            where: { tenantId },
            relations: ['role', 'location'],
        });
    }
    async findOne(id, tenantId) {
        const user = await this.userRepository.findOne({
            where: { id, tenantId },
            relations: ['role', 'location'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado.`);
        }
        return user;
    }
    async findByRoles(roleNames, tenantId, locationId) {
        const where = {
            tenantId,
            role: { name: (0, typeorm_2.In)(roleNames) },
        };
        if (locationId) {
            where.locationId = locationId;
        }
        return this.userRepository.find({ where, relations: ['role'] });
    }
    async update(id, updateUserDto, tenantId) {
        if (updateUserDto.hasOwnProperty('locationId') && !updateUserDto.locationId) {
            updateUserDto.locationId = null;
        }
        const user = await this.userRepository.preload({
            id,
            tenantId,
            ...updateUserDto,
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado.`);
        }
        const updatedUser = await this.userRepository.save(user);
        delete updatedUser.password;
        return updatedUser;
    }
    async remove(id, tenantId) {
        const result = await this.userRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado.`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map