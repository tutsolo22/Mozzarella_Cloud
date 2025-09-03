import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>, private dataSource: DataSource) {}

  create(createCustomerDto: CreateCustomerDto, tenantId: string): Promise<Customer> {
    const customer = this.customerRepository.create({ ...createCustomerDto, tenantId });
    return this.customerRepository.save(customer);
  }

  findAll(tenantId: string): Promise<Customer[]> {
    return this.customerRepository.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id, tenantId });
    if (!customer) {
      throw new NotFoundException(`El cliente con ID "${id}" no fue encontrado.`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, tenantId: string): Promise<Customer> {
    // Primero, nos aseguramos de que el cliente pertenezca al tenant
    await this.findOne(id, tenantId);

    const customer = await this.customerRepository.preload({
      id,
      ...updateCustomerDto,
    });
    // La comprobación de findOne ya maneja el caso de no encontrado
    return this.customerRepository.save(customer);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.customerRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`El cliente con ID "${id}" no fue encontrado.`);
    }
  }

  async findOrCreateByPhone(
    details: { phoneNumber: string; fullName: string },
    tenantId: string,
  ): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let customer = await queryRunner.manager.findOne(Customer, {
        where: { phoneNumber: details.phoneNumber, tenantId },
      });

      if (!customer) {
        customer = queryRunner.manager.create(Customer, { ...details, tenantId });
        await queryRunner.manager.save(customer);
      }

      await queryRunner.commitTransaction();
      return customer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}