import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Resume } from './resume.entity';

@Entity('Education')
export class Education {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  resumeId: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column()
  schoolName: string;

  @Column()
  major: string;

  @Column()
  location: string;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Resume, resume => resume.educations)
  @JoinColumn({ name: 'resumeId' })
  resume: Resume;
} 