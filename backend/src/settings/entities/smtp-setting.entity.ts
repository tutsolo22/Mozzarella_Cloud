import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class SmtpSetting {
  // Usamos un ID fijo para asegurar que solo haya una fila (patrón Singleton)
  @PrimaryColumn({ type: 'int', default: 1, unique: true })
  id: number;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column({ default: false })
  secure: boolean;

  @Column()
  user: string;

  // La contraseña no se seleccionará en las consultas por defecto por seguridad.
  // Se encriptará en una futura mejora.
  @Column({ nullable: true, select: false })
  pass: string;
}