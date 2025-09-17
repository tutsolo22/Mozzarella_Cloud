import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { License } from '../../licenses/entities/license.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { User } from '../../users/entities/user.entity';
import { Location } from '../../locations/entities/location.entity';

export enum TenantStatus {
  Active = 'active',
  Suspended = 'suspended',
  Trial = 'trial',
}

export enum TenantPlan {
  Basic = 'basic',
  Advanced = 'advanced',
  Enterprise = 'enterprise',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.Trial,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: TenantPlan,
    default: TenantPlan.Basic,
  })
  plan: TenantPlan;

  @OneToOne(() => License, (license) => license.tenant)
  license: License;

  @OneToOne(() => TenantConfiguration, (config) => config.tenant, { cascade: true, eager: true })
  configuration: TenantConfiguration;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Location, (location) => location.tenant)
  locations: Location[];

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  whatsappApiKey?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}