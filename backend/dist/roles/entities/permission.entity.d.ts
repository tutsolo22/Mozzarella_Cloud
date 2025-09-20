import { Role } from './role.entity';
export declare class Permission {
    id: string;
    action: string;
    subject: string;
    conditions: any;
    roles: Role[];
}
