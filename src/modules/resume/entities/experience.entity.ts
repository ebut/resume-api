import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Resume } from './resume.entity';

@Entity('Experience')
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  resumeId: number;

  @Column()
  companyName: string;

  @Column()
  position: string;

  @Column()
  department: string;

  @Column()
  jobRole: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Resume, resume => resume.experiences)
  @JoinColumn({ name: 'resumeId' })
  resume: Resume;
} 