import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum LicenseStatus {
  Active = 'active',
  Expired = 'expired',
  Revoked = 'revoked',
}

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  key: string;

  @OneToOne(() => Tenant, tenant => tenant.license)
  @JoinColumn()
  tenant: Tenant;

  @Column()
  userLimit: number;

  @Column()
  branchLimit: number;

  @Column()
  expiresAt: Date;

  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.Active })
  status: LicenseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}