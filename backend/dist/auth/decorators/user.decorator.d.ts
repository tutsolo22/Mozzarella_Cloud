import { Role } from '../enums/role.enum';
export interface UserPayload {
    userId: string;
    email: string;
    role: Role;
}
export declare const User: (...dataOrPipes: unknown[]) => ParameterDecorator;
