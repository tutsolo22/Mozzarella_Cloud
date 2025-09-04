import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';
interface GeocodingResult {
    lat: number;
    lng: number;
}
export declare class GeocodingService {
    private readonly httpService;
    private readonly configService;
    private readonly tenantRepository;
    private readonly logger;
    private defaultApiKey;
    constructor(httpService: HttpService, configService: ConfigService, tenantRepository: Repository<Tenant>);
    geocode(address: string, tenantId: string): Promise<GeocodingResult | null>;
}
export {};
