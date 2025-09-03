import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('permissions')
export class Permission {
  // Usamos el nombre como clave primaria para que sea único y fácil de referenciar.
  // Ej: 'products:create', 'orders:read', 'reports:sales:read'
  @PrimaryColumn({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;
}