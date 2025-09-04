import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, user: UserPayload): Promise<import("./entities/user.entity").User>;
    findAll(user: UserPayload): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string, user: UserPayload): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, user: UserPayload): Promise<import("./entities/user.entity").User>;
    remove(id: string, user: UserPayload): Promise<void>;
}
