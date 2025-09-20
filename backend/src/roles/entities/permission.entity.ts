import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['action', 'subject'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // e.g., 'manage', 'create', 'read', 'update', 'delete'

  @Column()
  subject: string; // e.g., 'Product', 'Order', 'all'

  @Column('jsonb', { nullable: true })
  conditions: any; // For row-level security, e.g., { createdBy: '${user.id}' }

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}