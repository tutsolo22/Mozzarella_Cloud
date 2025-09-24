import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findOrCreateByPhone(
    details: CreateCustomerDto, // Ahora recibe el DTO completo
    tenantId: string,
  ): Promise<Customer> {
    let customer = await this.customerRepository.findOneBy({
      phoneNumber: details.phoneNumber,
      tenantId,
    });
    if (customer) { // Si el cliente existe...
      // ...actualizamos su información con los nuevos detalles proporcionados.
      Object.assign(customer, details);
      await this.customerRepository.save(customer);
    } else {
      // Si no existe, lo creamos.
      customer = this.customerRepository.create({ ...details, tenantId });
      await this.customerRepository.save(customer);
    }
    return customer;
  }

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
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado.`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, tenantId: string): Promise<Customer> {
    const customer = await this.customerRepository.preload({ id, tenantId, ...updateCustomerDto });
    if (!customer) {
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado.`);
    }
    return this.customerRepository.save(customer);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.customerRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado.`);
    }
  }
}