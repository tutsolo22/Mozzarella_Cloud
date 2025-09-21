import { Tenant } from '../../tenants/entities/tenant.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ApiKeyServiceIdentifier {
  INVOICING = 'INVOICING',
  // Add other services here in the future
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 100 })
  name: string; // e.g., "Mi Sistema de Facturación"

  @Column({
    type: 'enum',
    enum: ApiKeyServiceIdentifier,
  })
  serviceIdentifier: ApiKeyServiceIdentifier;

  @Column({ type: 'varchar', length: 512 })
  apiUrl: string;

  @Column({ type: 'varchar', length: 512, comment: 'API Key encriptada' })
  key: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}