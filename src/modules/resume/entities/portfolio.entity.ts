import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Resume } from './resume.entity';

@Entity('Portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  resumeId: number;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Resume, resume => resume.portfolios)
  @JoinColumn({ name: 'resumeId' })
  resume: Resume;
} 