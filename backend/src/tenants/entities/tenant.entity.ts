import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { License } from '../../licenses/entities/license.entity';
import { TenantConfiguration } from '../../tenant-configuration/entities/tenant-configuration.entity';
import { Location } from '../../locations/entities/location.entity';

export enum TenantPlan {
  Trial = 'trial',
  Basic = 'basic',
  Premium = 'premium',
}

export enum TenantStatus {
  Active = 'active',
  Trial = 'trial',
  Suspended = 'suspended',
  Inactive = 'inactive',
}

@Entity()
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
    nullable: true,
  })
  plan: TenantPlan;

  @Column({ nullable: true })
  whatsappApiKey: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Location, (location) => location.tenant)
  locations: Location[];

  @OneToOne(() => License, (license) => license.tenant, { cascade: true })
  license: License;

  @OneToOne(() => TenantConfiguration, (config) => config.tenant, {
    cascade: true,
  })
  configuration: TenantConfiguration;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}