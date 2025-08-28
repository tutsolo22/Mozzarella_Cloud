import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { LicenseStatus } from '../enums/license-status.enum';

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  key: string; // El JWT que funciona como clave de licencia

  @OneToOne(() => Tenant, tenant => tenant.license)
  @JoinColumn()
  tenant: Tenant;

  @Column()
  tenantId: string;

  @Column()
  userLimit: number;

  @Column()
  branchLimit: number;

  @Column()
  expiresAt: Date;

  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.Activa })
  status: LicenseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}