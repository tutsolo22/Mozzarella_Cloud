import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto, tenantId: string): Promise<User>;
    findAll(tenantId: string): Promise<User[]>;
    findOne(id: string, tenantId: string): Promise<User>;
    findByRoles(roleNames: string[], tenantId: string, locationId?: string): Promise<User[]>;
    update(id: string, updateUserDto: UpdateUserDto, tenantId: string): Promise<User>;
    remove(id: string, tenantId: string): Promise<void>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
}
