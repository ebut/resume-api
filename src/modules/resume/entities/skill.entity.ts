import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Resume } from './resume.entity';

@Entity('Skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  resumeId: number;

  @Column()
  skillName: string;

  @Column()
  level: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Resume, resume => resume.skills)
  @JoinColumn({ name: 'resumeId' })
  resume: Resume;
} 