import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private readonly customerRepository;
    constructor(customerRepository: Repository<Customer>);
    findOrCreateByPhone(details: {
        phoneNumber: string;
        fullName: string;
    }, tenantId: string): Promise<Customer>;
    create(createCustomerDto: CreateCustomerDto, tenantId: string): Promise<Customer>;
    findAll(tenantId: string): Promise<Customer[]>;
    findOne(id: string, tenantId: string): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, tenantId: string): Promise<Customer>;
    remove(id: string, tenantId: string): Promise<void>;
}
