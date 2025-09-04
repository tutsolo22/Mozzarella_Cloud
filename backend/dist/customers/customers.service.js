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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
let CustomersService = class CustomersService {
    constructor(customerRepository, dataSource) {
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
    }
    create(createCustomerDto, tenantId) {
        const customer = this.customerRepository.create({ ...createCustomerDto, tenantId });
        return this.customerRepository.save(customer);
    }
    findAll(tenantId) {
        return this.customerRepository.find({ where: { tenantId } });
    }
    async findOne(id, tenantId) {
        const customer = await this.customerRepository.findOneBy({ id, tenantId });
        if (!customer) {
            throw new common_1.NotFoundException(`El cliente con ID "${id}" no fue encontrado.`);
        }
        return customer;
    }
    async update(id, updateCustomerDto, tenantId) {
        await this.findOne(id, tenantId);
        const customer = await this.customerRepository.preload({
            id,
            ...updateCustomerDto,
        });
        return this.customerRepository.save(customer);
    }
    async remove(id, tenantId) {
        const result = await this.customerRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`El cliente con ID "${id}" no fue encontrado.`);
        }
    }
    async findOrCreateByPhone(details, tenantId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let customer = await queryRunner.manager.findOne(customer_entity_1.Customer, {
                where: { phoneNumber: details.phoneNumber, tenantId },
            });
            if (!customer) {
                customer = queryRunner.manager.create(customer_entity_1.Customer, { ...details, tenantId });
                await queryRunner.manager.save(customer);
            }
            await queryRunner.commitTransaction();
            return customer;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.DataSource])
], CustomersService);
//# sourceMappingURL=customers.service.js.map