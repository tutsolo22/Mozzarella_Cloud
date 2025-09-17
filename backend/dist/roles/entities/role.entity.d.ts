import { Permission } from './permission.entity';
import { User } from '../../users/entities/user.entity';
import { RoleEnum } from '../enums/role.enum';
export declare class Role {
    id: string;
    name: RoleEnum;
    users: User[];
    permissions: Permission[];
}
