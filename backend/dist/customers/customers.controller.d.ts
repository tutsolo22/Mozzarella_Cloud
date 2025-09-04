import { UserPayload } from 'src/auth/decorators/user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: UserPayload): Promise<import("./entities/customer.entity").Customer>;
    findAll(user: UserPayload): Promise<import("./entities/customer.entity").Customer[]>;
    findOne(id: string, user: UserPayload): Promise<import("./entities/customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: UserPayload): Promise<import("./entities/customer.entity").Customer>;
    remove(id: string, user: UserPayload): Promise<void>;
}
