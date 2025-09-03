import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { License } from '../../licenses/entities/license.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { Location } from '../../locations/entities/location.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., "Pizzeria Bella Napoli"

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.Activo,
  })
  status: TenantStatus;

  @OneToOne(() => License, (license) => license.tenant, { nullable: true, cascade: true })
  @JoinColumn()
  license: License;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  configuration: TenantConfiguration;

  @Column({ type: 'varchar', length: 128, unique: true, nullable: true })
  whatsappApiKey: string | null;

  @OneToMany(() => User, user => user.tenant)
  users: User[];

  @OneToMany(() => Location, location => location.tenant)
  locations: Location[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}