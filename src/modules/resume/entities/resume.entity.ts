import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Education } from './education.entity';
import { Experience } from './experience.entity';
import { Skill } from './skill.entity';
import { Portfolio } from './portfolio.entity';

@Entity('Resumes')
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  jobStatus: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.resumes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Education, education => education.resume, { cascade: true })
  educations: Education[];

  @OneToMany(() => Experience, experience => experience.resume, { cascade: true })
  experiences: Experience[];

  @OneToMany(() => Skill, skill => skill.resume, { cascade: true })
  skills: Skill[];

  @OneToMany(() => Portfolio, portfolio => portfolio.resume, { cascade: true })
  portfolios: Portfolio[];
} 