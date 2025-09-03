import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Location } from '../../locations/entities/location.entity';

export enum UserStatus {
  PendingVerification = 'pending_verification',
  Active = 'active',
  Suspended = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Ocultar la contraseña por defecto en las consultas
  password?: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordResetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  passwordResetExpires?: Date | null;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PendingVerification,
  })
  status: UserStatus;

  @Column({ nullable: true })
  verificationToken?: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column()
  roleId: string;

  @ManyToOne(() => Tenant, tenant => tenant.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true }) // Super-admin no necesita un tenant
  tenantId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'ID de la sucursal a la que pertenece el usuario (si aplica)' })
  locationId?: string;

  @ManyToOne(() => Location, location => location.users, { nullable: true, eager: false })
  @JoinColumn({ name: 'locationId' })
  location?: Location;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Capacidad máxima de carga en kg para repartidores',
  })
  maxWeightCapacityKg?: number;

  @Column('decimal', {
    precision: 10,
    scale: 4,
    nullable: true,
    comment: 'Capacidad máxima de volumen en m³ para repartidores',
  })
  maxVolumeCapacityM3?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}