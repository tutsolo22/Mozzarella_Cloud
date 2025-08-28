import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { License } from '../../licenses/entities/license.entity';

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
  license: License;

  @OneToMany(() => User, user => user.tenant)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}