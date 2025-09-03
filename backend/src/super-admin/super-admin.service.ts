import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  findAllTenants(): Promise<{ id: string; name: string }[]> {
    return this.tenantRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }
}