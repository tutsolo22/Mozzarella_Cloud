import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from '../../locations/entities/location.entity';

export enum CostFrequency {
  OneTime = 'one-time',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

@Entity('overhead_costs')
export class OverheadCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'uuid', comment: 'ID de la sucursal a la que pertenece el costo' })
  locationId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: CostFrequency, default: CostFrequency.OneTime })
  frequency: CostFrequency;

  @Column({ type: 'date' })
  costDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}