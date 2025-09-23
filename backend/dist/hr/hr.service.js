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
var HrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("./entities/employee.entity");
const position_entity_1 = require("./entities/position.entity");
const user_entity_1 = require("../users/entities/user.entity");
const auth_service_1 = require("../auth/auth.service");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
let HrService = HrService_1 = class HrService {
    constructor(employeeRepository, positionRepository, dataSource, authService) {
        this.employeeRepository = employeeRepository;
        this.positionRepository = positionRepository;
        this.dataSource = dataSource;
        this.authService = authService;
        this.logger = new common_1.Logger(HrService_1.name);
    }
    async createPosition(dto, tenantId) {
        const position = this.positionRepository.create({ ...dto, tenantId });
        return this.positionRepository.save(position);
    }
    findAllPositions(tenantId) {
        return this.positionRepository.find({ where: { tenantId }, order: { name: 'ASC' } });
    }
    async updatePosition(id, dto, tenantId) {
        const position = await this.positionRepository.preload({ id, tenantId, ...dto });
        if (!position) {
            throw new common_1.NotFoundException(`Puesto con ID #${id} no encontrado.`);
        }
        return this.positionRepository.save(position);
    }
    async removePosition(id, tenantId) {
        const positionInUse = await this.employeeRepository.count({ where: { positionId: id, tenantId } });
        if (positionInUse > 0) {
            throw new common_1.ConflictException(`No se puede eliminar el puesto porque está asignado a ${positionInUse} empleado(s).`);
        }
        const result = await this.positionRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Puesto con ID #${id} no encontrado.`);
        }
    }
    async createEmployee(createEmployeeDto, tenantId, locationId) {
        const { createSystemUser, email, roleId, ...employeeData } = createEmployeeDto;
        const savedEmployee = await this.dataSource.transaction(async (transactionalEntityManager) => {
            let newEmployee = transactionalEntityManager.create(employee_entity_1.Employee, {
                ...employeeData,
                tenantId,
            });
            newEmployee = await transactionalEntityManager.save(newEmployee);
            if (createSystemUser) {
                if (!email || !roleId) {
                    throw new common_1.BadRequestException('El email y el rol son requeridos para crear un acceso al sistema.');
                }
                const existingUser = await transactionalEntityManager.findOneBy(user_entity_1.User, { email });
                if (existingUser) {
                    throw new common_1.ConflictException(`El email '${email}' ya está en uso por otro usuario.`);
                }
                const temporaryPassword = crypto.randomBytes(20).toString('hex');
                const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
                const newUser = transactionalEntityManager.create(user_entity_1.User, {
                    email,
                    password: hashedPassword,
                    fullName: employeeData.fullName,
                    roleId,
                    tenantId,
                    locationId,
                    status: user_entity_1.UserStatus.PendingVerification,
                });
                const savedUser = await transactionalEntityManager.save(newUser);
                newEmployee.userId = savedUser.id;
                newEmployee.user = savedUser;
                await transactionalEntityManager.save(newEmployee);
            }
            return newEmployee;
        });
        if (createSystemUser && savedEmployee.user) {
            try {
                await this.authService.sendAccountSetupEmail(savedEmployee.user);
            }
            catch (error) {
                this.logger.error(`Empleado creado, pero falló el envío de la invitación a ${email}`, error.stack);
            }
        }
        return this.employeeRepository.findOne({ where: { id: savedEmployee.id }, relations: ['user', 'position'] });
    }
    findAllEmployees(tenantId, locationId) {
        const whereClause = { tenantId };
        if (locationId) {
            whereClause.user = { locationId };
        }
        return this.employeeRepository.find({ where: whereClause, relations: ['user', 'position'] });
    }
    async updateEmployee(id, dto, tenantId) {
        const employee = await this.employeeRepository.preload({ id, tenantId, ...dto });
        if (!employee) {
            throw new common_1.NotFoundException(`Empleado con ID #${id} no encontrado.`);
        }
        return this.employeeRepository.save(employee);
    }
    async removeEmployee(id, tenantId) {
        const result = await this.employeeRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Empleado con ID #${id} no encontrado.`);
        }
    }
    async calculateLaborCost(tenantId, startDate, endDate, locationId) {
        const whereClause = { tenantId };
        if (locationId) {
            whereClause.user = { locationId };
        }
        const employees = await this.employeeRepository.find({ where: whereClause, relations: ['position'] });
        if (employees.length === 0) {
            return 0;
        }
        const totalDaysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
        let totalCost = 0;
        for (const employee of employees) {
            const salary = Number(employee.salary);
            let dailyCost = 0;
            switch (employee.paymentFrequency) {
                case employee_entity_1.PaymentFrequency.Daily:
                    dailyCost = salary;
                    break;
                case employee_entity_1.PaymentFrequency.Weekly:
                    dailyCost = salary / 7;
                    break;
                case employee_entity_1.PaymentFrequency.BiWeekly:
                    dailyCost = salary / 14;
                    break;
                case employee_entity_1.PaymentFrequency.Monthly:
                    dailyCost = salary / 30.44;
                    break;
            }
            totalCost += dailyCost * totalDaysInPeriod;
        }
        return totalCost;
    }
    async calculateLaborCostForLocation(locationId, startDate, endDate) {
        const firstEmployee = await this.employeeRepository.findOne({ where: { user: { locationId } } });
        if (!firstEmployee)
            return 0;
        return this.calculateLaborCost(firstEmployee.tenantId, startDate, endDate, locationId);
    }
};
exports.HrService = HrService;
exports.HrService = HrService = HrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        auth_service_1.AuthService])
], HrService);
//# sourceMappingURL=hr.service.js.map