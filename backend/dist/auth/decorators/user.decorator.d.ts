export interface UserPayload {
    userId: string;
    email: string;
    role: string;
    locationId?: string;
    tenantId: string;
}
export declare const User: (...dataOrPipes: unknown[]) => ParameterDecorator;
