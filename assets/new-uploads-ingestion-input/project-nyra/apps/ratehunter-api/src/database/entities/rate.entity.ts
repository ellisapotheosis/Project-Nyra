import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rates')
export class Rate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'loan_type' })
  loanType: string;

  @Column()
  term: string;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  apr: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  points: number;

  @Column({ name: 'lender_name' })
  lenderName: string;

  @Column({ type: 'jsonb', nullable: true })
  requirements?: {
    minCreditScore?: number;
    maxLTV?: number;
    minDownPayment?: number;
  };

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
