import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: ['purchase', 'refinance'],
    name: 'loan_type',
  })
  loanType: 'purchase' | 'refinance';

  @Column({ name: 'property_value', type: 'decimal', precision: 12, scale: 2 })
  propertyValue: number;

  @Column({
    type: 'enum',
    enum: ['excellent', 'good', 'fair', 'poor'],
    name: 'credit_score',
  })
  creditScore: 'excellent' | 'good' | 'fair' | 'poor';

  @Column({
    type: 'enum',
    enum: ['new', 'contacted', 'qualified', 'closed', 'lost'],
    default: 'new',
  })
  status: string;

  @Column({ nullable: true, name: 'assigned_to' })
  assignedTo?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
